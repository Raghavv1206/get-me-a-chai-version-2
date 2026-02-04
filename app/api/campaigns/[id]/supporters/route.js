import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import User from '@/models/User';

export async function GET(request, { params }) {
    try {
        const { id: campaignId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        await connectDb();

        // Get top supporters (top 10)
        const topSupporters = page === 1 ? await Payment.aggregate([
            {
                $match: {
                    campaign: campaignId,
                    done: true,
                    status: 'success'
                }
            },
            {
                $group: {
                    _id: '$userId',
                    totalAmount: { $sum: '$amount' },
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    anonymous: { $first: '$anonymous' },
                    hideAmount: { $first: '$hideAmount' },
                    lastSupport: { $max: '$createdAt' }
                }
            },
            {
                $sort: { totalAmount: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $addFields: {
                    profilePic: { $arrayElemAt: ['$userDetails.profilepic', 0] }
                }
            }
        ]) : [];

        // Get recent supporters with pagination
        const supporters = await Payment.find({
            campaign: campaignId,
            done: true,
            status: 'success'
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name profilepic')
            .lean();

        const total = await Payment.countDocuments({
            campaign: campaignId,
            done: true,
            status: 'success'
        });

        // Format supporters data
        const formattedSupporters = supporters.map(payment => ({
            _id: payment._id,
            name: payment.anonymous ? 'Anonymous' : (payment.userId?.name || payment.name),
            profilePic: payment.anonymous ? null : payment.userId?.profilepic,
            amount: payment.amount,
            message: payment.message,
            anonymous: payment.anonymous,
            hideAmount: payment.hideAmount,
            createdAt: payment.createdAt
        }));

        return NextResponse.json({
            success: true,
            supporters: formattedSupporters,
            topSupporters: topSupporters.map(supporter => ({
                _id: supporter._id,
                name: supporter.anonymous ? 'Anonymous' : supporter.name,
                profilePic: supporter.anonymous ? null : supporter.profilePic,
                totalAmount: supporter.totalAmount,
                anonymous: supporter.anonymous,
                hideAmount: supporter.hideAmount
            })),
            hasMore: skip + supporters.length < total,
            total,
            page
        });
    } catch (error) {
        console.error('Error fetching supporters:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch supporters', error: error.message },
            { status: 500 }
        );
    }
}
