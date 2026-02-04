// app/dashboard/create-campaign/page.js
import { redirect } from 'next/navigation';

/**
 * Redirect page for legacy URL
 * Redirects /dashboard/create-campaign to /dashboard/campaign/new
 */
export default function CreateCampaignRedirect() {
    redirect('/dashboard/campaign/new');
}
