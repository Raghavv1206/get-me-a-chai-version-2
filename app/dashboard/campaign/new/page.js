// app/dashboard/campaign/new/page.js
/**
 * NewCampaignPage
 *
 * Server Component — fetches payment-readiness flag for the creator,
 * then hands it down to the client-side CampaignBuilderWizard.
 *
 * Only CREATORS need Razorpay credentials (to publish a campaign).
 * Supporters who visit a campaign page are never affected by this check.
 */
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import CampaignBuilderWizard from '@/components/campaign/CampaignBuilderWizard';

export const metadata = {
    title: 'Create Campaign - Get Me A Chai',
    description: 'Launch your crowdfunding campaign with AI-powered storytelling',
};

export default async function NewCampaignPage() {
    // Protect route — must be authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/login?callbackUrl=/dashboard/campaign/new');
    }

    // Fetch only the payment credential fields — no sensitive data leaks to client.
    // We derive a boolean so the raw keys never leave the server.
    await connectDb();
    const user = await User.findById(session.user.id)
        .select('razorpayid razorpaysecret')
        .lean();

    const hasRazorpayCredentials =
        !!(user?.razorpayid?.trim()) && !!(user?.razorpaysecret?.trim());

    return (
        <div className="min-h-screen bg-gray-950">
            {/*
              * Only the boolean is passed to the client component.
              * The actual keys remain on the server only.
              */}
            <CampaignBuilderWizard hasRazorpayCredentials={hasRazorpayCredentials} />
        </div>
    );
}
