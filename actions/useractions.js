// actions/useractions.js
"use server"

import Razorpay from "razorpay"
import Payment from "@/models/Payment"
import connectDb from "@/db/connectDb"
import User from "@/models/User"
import { createLogger } from "@/lib/logger"
import { validateString, validateNumber, ValidationError } from "@/lib/validation"
import config from "@/lib/config"

const logger = createLogger('UserActions');


export const initiate = async (amount, to_username, paymentform) => {
    try {
        logger.info('Initiating payment', { amount, to_username });

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

        // Fetch the user who is receiving the payment
        let user = await User.findOne({ username: validatedUsername });

        if (!user) {
            logger.warn('User not found for payment', { username: validatedUsername });
            throw new Error('User not found');
        }

        // Check if user has configured Razorpay credentials
        const razorpayId = user.razorpayid || config.payment.razorpay.keyId;
        const razorpaySecret = user.razorpaysecret || config.payment.razorpay.keySecret;

        if (!razorpayId || !razorpaySecret) {
            logger.error('Razorpay credentials not configured', {
                username: validatedUsername,
                hasUserId: !!user.razorpayid,
                hasUserSecret: !!user.razorpaysecret
            });
            throw new Error('Payment gateway not configured. Please contact the creator.');
        }

        // Initialize Razorpay instance
        var instance = new Razorpay({
            key_id: razorpayId,
            key_secret: razorpaySecret
        });

        let options = {
            amount: Number.parseInt(validatedAmount),
            currency: config.payment.razorpay.currency || "INR",
        };

        let order = await instance.orders.create(options);

        logger.info('Razorpay order created', {
            orderId: order.id,
            amount: validatedAmount,
            to_username: validatedUsername
        });

        // Create a payment object
        await Payment.create({
            oid: order.id,
            amount: validatedAmount / 100,
            to_user: validatedUsername,
            name: paymentform.name,
            message: paymentform.message
        });

        return order;
    } catch (error) {
        logger.error('Payment initiation failed', {
            error: { name: error.name, message: error.message },
            amount,
            to_username
        });

        // Provide user-friendly error messages
        let userMessage = error.message;

        if (error instanceof ValidationError) {
            // Check if it's an amount validation error (in paise)
            if (error.message?.includes('must not exceed') && error.message?.includes('Amount')) {
                userMessage = `Payment amount is too high. Maximum allowed is ₹${(config.payment.razorpay.maxAmount).toLocaleString('en-IN')}`;
            } else if (error.message?.includes('must be at least') && error.message?.includes('Amount')) {
                userMessage = `Payment amount is too low. Minimum required is ₹${config.payment.razorpay.minAmount}`;
            } else {
                // Other validation errors are already user-friendly
                userMessage = error.message;
            }
        } else if (error.message?.includes('Amount must not exceed')) {
            // Razorpay API error
            userMessage = `Payment amount is too high. Maximum allowed is ₹${(config.payment.razorpay.maxAmount).toLocaleString('en-IN')}`;
        } else if (error.message?.includes('Amount must be at least')) {
            // Razorpay API error
            userMessage = `Payment amount is too low. Minimum required is ₹${config.payment.razorpay.minAmount}`;
        } else if (error.message?.includes('key_id') || error.message?.includes('key_secret')) {
            userMessage = 'Payment gateway credentials are invalid. Please contact the creator.';
        } else if (error.message?.includes('User not found')) {
            userMessage = 'Creator account not found.';
        } else if (error.message?.includes('not configured')) {
            userMessage = error.message; // Already user-friendly
        } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            userMessage = 'Unable to connect to payment gateway. Please check your internet connection.';
        } else {
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
        let user = u.toObject({ flattenObjectIds: true });
        return user;
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