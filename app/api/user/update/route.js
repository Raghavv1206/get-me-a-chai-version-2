// app/api/user/update/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import { createLogger } from '@/lib/logger';
import { validateString } from '@/lib/validation';

const logger = createLogger('UserUpdateAPI');

export async function POST(req) {
    const startTime = Date.now();

    try {
        logger.request('POST', '/api/user/update');

        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session) {
            logger.warn('Unauthorized update attempt');
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();

        // Parse request body
        const body = await req.json();
        const {
            name,
            username,
            bio,
            profileImage,
            coverImage,
            razorpayid,
            razorpaysecret
        } = body;

        logger.info('Updating user profile', {
            email: session.user.email,
            fields: Object.keys(body)
        });

        // Validate required fields
        if (name) {
            validateString(name, {
                fieldName: 'Name',
                minLength: 1,
                maxLength: 100
            });
        }

        // Find user by email
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            logger.warn('User not found', { email: session.user.email });
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if username is being changed and if it's available
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                logger.warn('Username already taken', { username });
                return NextResponse.json(
                    { success: false, error: 'Username already taken' },
                    { status: 400 }
                );
            }
        }

        // Update user fields
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (username !== undefined) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (razorpayid !== undefined) updateData.razorpayid = razorpayid;
        if (razorpaysecret !== undefined) updateData.razorpaysecret = razorpaysecret;

        // Update user
        await User.updateOne(
            { email: session.user.email },
            { $set: updateData }
        );

        const duration = Date.now() - startTime;

        logger.info('User profile updated successfully', {
            email: session.user.email,
            updatedFields: Object.keys(updateData),
            duration: `${duration}ms`
        });

        logger.response('POST', '/api/user/update', 200, duration);

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('User update failed', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            duration: `${duration}ms`
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update profile',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
