// C:\Users\ragha\project\get-me-a-chai\app\[username]\page.js
import React from 'react'
import PaymentPage from '@/components/PaymentPage'
import { notFound } from "next/navigation"
import connectDb from '@/db/connectDb'
import User from '@/models/User'
const Username = async ({ params }) => {
  const awaitedParams = await params;
  const { username } = awaitedParams;

  // If the username is not present in the database, show a 404 page
  await connectDb();
  let u = await User.findOne({ username });
  if (!u) {
    return notFound();
  }

  return (
    <>
    
      <PaymentPage username={username} />
    </>
  );
}

export default Username
 
export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  return {
    title: `Support ${awaitedParams.username} - Get Me A Chai`,
  };
}