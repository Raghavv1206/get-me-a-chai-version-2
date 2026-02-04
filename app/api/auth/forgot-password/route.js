// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req) {
  try {
    await connectDb();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that user doesn't exist
      return NextResponse.json(
        { message: 'If the email exists, a reset link has been sent' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // In production, send email here
    // For now, just return success
    // TODO: Implement email sending with reset link

    return NextResponse.json(
      { message: 'If the email exists, a reset link has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
