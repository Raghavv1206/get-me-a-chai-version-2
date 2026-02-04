// app/api/auth/check-email/route.js
import { NextResponse } from "next/server";
import connectDb from '@/db/connectDb';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDb();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}