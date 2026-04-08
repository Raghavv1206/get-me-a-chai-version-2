// actions/useractions.js
"use server"

import Razorpay from "razorpay"
import Payment from "@/models/Payment"
import connectDb from "@/db/connectDb"
import User from "@/models/User"
import { createLogger } from "@/lib/logger"
import { validateString, validateNumber, ValidationError } from "@/lib/validation"
import config from "@/lib/config"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const logger = createLogger('UserActions');


export const initiate = async (amount, to_username, paymentform) => {
    try {
        logger.info('Initiating payment', { amount, to_username });

        // Check if user is authenticated (server-side)
        const session = await getServerSession(authOptions);
        if (!session) {
            logger.warn('Unauthenticated payment attempt', { to_username });
            throw new Error('You must be logged in to make a payment. Please login and try again.');
        }

        logger.info('Payment initiated by authenticated user', {
            userEmail: session.user?.email,
            to_username
        });

        await connectDb();

        // Validate inputs
        const validatedUsername = validateString(to_username, {
            fieldName: 'Username',
            minLength: 1,
            maxLength: 50
        });

        const validatedAmount = validateNumber(amount, {
            fieldName: 'Amount',
            min: config.payment.razorpay.minAmount * 100,
            max: config.payment.razorpay.maxAmount * 100,
            integer: true
        });

        // Validate paymentform fields that the Payment model requires
        const supporterName = (paymentform?.name || '').trim();
        if (!supporterName) {
            throw new Error('Please enter your name before making a payment.');
        }

        const supporterMessage = (paymentform?.message || '').trim();

        // Fetch the user who is receiving the payment
        let user = await User.findOne({ username: validatedUsername });

        if (!user) {
            logger.warn('User not found for payment', { username: validatedUsername });
            throw new Error('User not found');
        }

        // Use only the creator's own per-user Razorpay credentials (stored in DB via Settings).
        // We intentionally do NOT fall back to global env vars — each creator must configure
        // their own Razorpay account in the dashboard Settings page.
        const razorpayId = user.razorpayid?.trim();
        const razorpaySecret = user.razorpaysecret?.trim();

        if (!razorpayId || !razorpaySecret) {
            logger.error('Creator has not configured Razorpay credentials', {
                username: validatedUsername,
                hasUserId: !!user.razorpayid,
                hasUserSecret: !!user.razorpaysecret,
            });
            throw new Error(
                'This creator has not set up their payment gateway yet. ' +
                'Please ask them to add their Razorpay Key ID and Secret in their Settings.'
            );
        }

        logger.info('Creating Razorpay instance', {
            username: validatedUsername,
            keyIdLength: razorpayId.length,
        });

        // Initialize Razorpay instance
        let instance;
        try {
            instance = new Razorpay({
                key_id: razorpayId,
                key_secret: razorpaySecret
            });
        } catch (rzpInitError) {
            logger.error('Razorpay SDK initialization failed', {
                error: rzpInitError.message,
                username: validatedUsername,
            });
            throw new Error('Payment gateway credentials are invalid. Please contact the creator.');
        }

        let options = {
            amount: Number.parseInt(validatedAmount),
            currency: config.payment.razorpay.currency || "INR",
        };

        logger.info('Creating Razorpay order', {
            amount: options.amount,
            currency: options.currency,
            username: validatedUsername
        });

        // Create Razorpay order — wrapped separately to catch Razorpay API errors
        let order;
        try {
            order = await instance.orders.create(options);
        } catch (rzpError) {
            // Razorpay SDK wraps API errors in error.error.description
            const rzpDescription = rzpError?.error?.description
                || rzpError?.description
                || rzpError?.message
                || 'Unknown Razorpay error';
            const rzpCode = rzpError?.error?.code || rzpError?.statusCode || rzpError?.code;

            logger.error('Razorpay order creation failed', {
                description: rzpDescription,
                code: rzpCode,
                statusCode: rzpError?.statusCode,
                fullError: JSON.stringify(rzpError, Object.getOwnPropertyNames(rzpError)),
                username: validatedUsername,
            });

            // Map Razorpay-specific errors to user-friendly messages
            if (rzpCode === 'BAD_REQUEST_ERROR') {
                if (rzpDescription.includes('key_id') || rzpDescription.includes('key_secret') || rzpDescription.includes('authentication')) {
                    throw new Error('Payment gateway credentials are invalid. Please contact the creator to update their Razorpay settings.');
                }
                if (rzpDescription.includes('amount')) {
                    throw new Error(`Invalid payment amount. ${rzpDescription}`);
                }
                throw new Error(`Payment gateway error: ${rzpDescription}`);
            } else if (rzpCode === 'GATEWAY_ERROR' || rzpCode === 'SERVER_ERROR') {
                throw new Error('Payment gateway is temporarily unavailable. Please try again in a few minutes.');
            } else if (rzpError.code === 'ENOTFOUND' || rzpError.code === 'ETIMEDOUT' || rzpError.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to payment gateway. Please check your internet connection and try again.');
            } else {
                throw new Error(`Payment gateway error: ${rzpDescription}`);
            }
        }

        logger.info('Razorpay order created', {
            orderId: order.id,
            amount: validatedAmount,
            to_username: validatedUsername
        });

        // Create a payment record — wrapped to catch Mongoose validation errors
        try {
            await Payment.create({
                oid: order.id,
                amount: validatedAmount / 100,
                to_user: validatedUsername,
                name: supporterName,
                email: session.user?.email || paymentform?.email || '',
                userId: session.user?.id || null,
                message: supporterMessage,
                campaign: paymentform?.campaign || null
            });
        } catch (dbError) {
            logger.error('Failed to create payment record', {
                error: dbError.message,
                orderId: order.id,
                validationErrors: dbError.errors
                    ? Object.entries(dbError.errors).map(([k, v]) => `${k}: ${v.message}`)
                    : undefined,
            });

            // Mongoose validation error
            if (dbError.name === 'ValidationError') {
                const fields = Object.keys(dbError.errors || {});
                throw new Error(`Please fill in all required fields: ${fields.join(', ')}`);
            }
            throw new Error('Failed to save payment record. Please try again.');
        }

        return order;
    } catch (error) {
        // If the error was already thrown with a user-friendly message from above,
        // re-throw it directly rather than wrapping it again
        logger.error('Payment initiation failed', {
            error: {
                name: error.name,
                message: error.message,
                code: error.code,
            },
            amount,
            to_username
        });

        // Provide user-friendly error messages for errors not already handled above
        let userMessage = error.message;

        if (error instanceof ValidationError) {
            // ValidationError from our lib/validation.js
            if (error.message?.includes('must not exceed') && error.message?.includes('Amount')) {
                userMessage = `Payment amount is too high. Maximum allowed is ₹${(config.payment.razorpay.maxAmount).toLocaleString('en-IN')}`;
            } else if (error.message?.includes('must be at least') && error.message?.includes('Amount')) {
                userMessage = `Payment amount is too low. Minimum required is ₹${config.payment.razorpay.minAmount}`;
            }
            // Other validation errors are already user-friendly
        } else if (
            // Don't wrap already user-friendly messages from our inner catches
            userMessage.includes('Payment gateway') ||
            userMessage.includes('must be logged in') ||
            userMessage.includes('not set up') ||
            userMessage.includes('not found') ||
            userMessage.includes('Please enter your name') ||
            userMessage.includes('required fields') ||
            userMessage.includes('Invalid payment amount') ||
            userMessage.includes('temporarily unavailable') ||
            userMessage.includes('internet connection')
        ) {
            // Already a user-friendly message — pass through
        } else {
            // Truly unknown error — generic fallback
            userMessage = 'Failed to initiate payment. Please try again or contact support.';
        }

        throw new Error(userMessage);
    }
}


export const fetchuser = async (username) => {
    try {
        await connectDb();
        let u = await User.findOne({ username: username });
        if (!u) return null;

        const user = u.toObject({ flattenObjectIds: true });

        // Strip sensitive fields before the result is serialized and sent to the browser.
        // razorpaysecret is the Razorpay API secret — it must never be exposed client-side.
        // razorpayid (the public Key ID) is kept because the checkout modal needs it.
        const { razorpaysecret, password, ...safeUser } = user;

        return safeUser;
    } catch (error) {
        logger.error('Failed to fetch user', { error: error.message, username });
        throw error;
    }
}


export const fetchpayments = async (username) => {
    try {
        await connectDb();
        let p = await Payment.find({ to_user: username, done: true }).sort({ amount: -1 }).limit(10).lean();
        return p.map(payment => ({
            ...payment,
            _id: payment._id?.toString() || payment._id,
            campaign: payment.campaign?.toString() || payment.campaign,
            to_user: payment.to_user?.toString() || payment.to_user,
            createdAt: payment.createdAt?.toISOString() || payment.createdAt,
            updatedAt: payment.updatedAt?.toISOString() || payment.updatedAt,
        }));
    } catch (error) {
        logger.error('Failed to fetch payments', { error: error.message, username });
        throw error;
    }
}

export const updateProfile = async (data, oldusername) => {
    try {
        await connectDb();
        let ndata = Object.fromEntries(data);

        if (oldusername !== ndata.username) {
            let u = await User.findOne({ username: ndata.username });
            if (u) {
                logger.warn('Username already exists', { username: ndata.username });
                return { error: "Username already exists" };
            }
            await User.updateOne({ email: ndata.email }, ndata);
            await Payment.updateMany({ to_user: oldusername }, { to_user: ndata.username });
            logger.info('Profile updated with username change', { oldUsername: oldusername, newUsername: ndata.username });
        } else {
            await User.updateOne({ email: ndata.email }, ndata);
            logger.info('Profile updated', { username: oldusername });
        }
        return { success: true };
    } catch (error) {
        logger.error('Failed to update profile', { error: error.message, oldusername });
        throw error;
    }
}