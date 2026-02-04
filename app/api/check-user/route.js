// C:\Users\ragha\project\get-me-a-chai\app\api\check-user\route.js
import { NextResponse } from "next/server";
import connectDb from '@/db/connectDb';
import User from '@/models/User';

export async function POST(req) {
  await connectDb();
  const { email } = await req.json();
  const user = await User.findOne({ email });
  if (user) {
    return NextResponse.json({ exists: true, username: user.username });
  } else {
    return NextResponse.json({ exists: false });
  }
}
