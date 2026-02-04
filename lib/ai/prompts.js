// lib/ai/prompts.js - AI Prompt Templates

/**
 * AI Prompt Templates for Campaign Generation
 * 
 * Features:
 * - Campaign story generation
 * - Funding goal suggestions
 * - Milestone creation
 * - Reward tier suggestions
 * - FAQ generation
 * - Quality scoring
 * - Chatbot prompts
 * - Recommendation engine
 */

import config from '../config';

/**
 * Generate campaign story prompt
 */
export function getCampaignStoryPrompt(data) {
  const { category, brief, goal, projectType } = data;

  return `You are an expert crowdfunding campaign writer. Create a compelling campaign story for a ${category} project.

Project Details:
- Category: ${category}
- Type: ${projectType}
- Goal: ₹${goal}
- Brief Description: ${brief}

Generate a well-structured campaign story with the following sections:

1. **Catchy Title** (10-15 words max, emotional and action-oriented)
2. **Hook** (2-3 sentences that grab attention immediately)
3. **The Problem** (What problem does this project solve?)
4. **The Solution** (How will this project solve it?)
5. **Why Now** (Why is this the right time?)
6. **About Me/Us** (Brief creator background, builds trust)
7. **How Funds Will Be Used** (Transparent breakdown)
8. **Impact** (What difference will this make?)
9. **Call to Action** (Compelling ask for support)

Make it:
- Authentic and personal
- Emotionally engaging
- Clear and concise
- Specific with details
- Optimistic but realistic
- Around 400-600 words total

Format as JSON:
{
  "title": "Campaign title",
  "hook": "Opening hook paragraph",
  "story": "Full campaign story with all sections"
}`;
}

/**
 * Generate funding goal suggestion prompt
 */
export function getGoalSuggestionPrompt(data) {
  const { category, projectType, brief } = data;

  return `You are a crowdfunding expert analyzing funding goals.

Project Details:
- Category: ${category}
- Type: ${projectType}
- Description: ${brief}

Based on similar successful campaigns in this category, suggest a realistic funding goal in INR (Indian Rupees).

Consider:
- Average successful campaign goals in ${category}
- Project scope and complexity
- Typical costs for ${projectType} projects
- Market standards in India

Provide response as JSON:
{
  "suggestedGoal": 50000,
  "reasoning": "Brief explanation of why this amount",
  "breakdown": {
    "development": 20000,
    "marketing": 10000,
    "operations": 15000,
    "contingency": 5000
  }
}`;
}

/**
 * Generate milestones prompt
 */
export function getMilestonesPrompt(data) {
  const { goal, category, duration } = data;

  return `Create 4-5 realistic funding milestones for a ${category} crowdfunding campaign.

Campaign Details:
- Total Goal: ₹${goal}
- Category: ${category}
- Duration: ${duration} days

Create milestones that:
- Are evenly distributed (25%, 50%, 75%, 100%)
- Have specific, achievable deliverables
- Build momentum and excitement
- Are realistic for the timeline

Format as JSON array:
[
  {
    "percentage": 25,
    "amount": ${goal * 0.25},
    "title": "Milestone title",
    "description": "What will be achieved",
    "deliverable": "Specific output"
  }
]`;
}

/**
 * Generate reward tiers prompt
 */
export function getRewardTiersPrompt(data) {
  const { goal, category, brief } = data;

  return `Create 4-5 attractive reward tiers for a ${category} crowdfunding campaign.

Campaign Details:
- Goal: ₹${goal}
- Category: ${category}
- Project: ${brief}

Create tiers that:
- Start from ₹100 (entry level)
- Scale up to ₹5000+ (premium)
- Offer real value at each level
- Are creative and relevant to the project
- Include both digital and physical rewards (if applicable)

Format as JSON array:
[
  {
    "amount": 100,
    "title": "Reward tier name",
    "description": "What supporters get",
    "deliveryTime": "Estimated delivery (e.g., '1 month after campaign ends')",
    "limited": false,
    "quantity": null
  }
]`;
}

/**
 * Generate FAQs prompt
 */
export function getFAQsPrompt(data) {
  const { category, story, goal } = data;

  return `Generate 6-8 common FAQs for a ${category} crowdfunding campaign.

Campaign Context:
- Category: ${category}
- Goal: ₹${goal}
- Story: ${story.substring(0, 500)}...

Create FAQs that address:
- How funds will be used
- Timeline and delivery
- Refund policy
- Creator credibility
- Project risks
- Stretch goals
- Updates frequency
- Contact information

Format as JSON array:
[
  {
    "question": "Question text?",
    "answer": "Detailed answer"
  }
]`;
}

/**
 * Campaign quality scoring prompt
 */
export function getQualityScoringPrompt(campaign) {
  return `You are a crowdfunding expert evaluating campaign quality.

Analyze this campaign and provide a quality score (0-100) with detailed feedback:

Campaign Data:
- Title: ${campaign.title}
- Category: ${campaign.category}
- Goal: ₹${campaign.goal}
- Story Length: ${campaign.story?.length || 0} characters
- Has Cover Image: ${campaign.coverImage ? 'Yes' : 'No'}
- Number of Rewards: ${campaign.rewards?.length || 0}
- Number of FAQs: ${campaign.faqs?.length || 0}
- Milestones: ${campaign.milestones?.length || 0}

Evaluate on:
1. Story Quality (25 points) - Clarity, emotion, structure
2. Goal Realism (20 points) - Appropriate for scope
3. Visual Quality (20 points) - Images, presentation
4. Reward Attractiveness (15 points) - Value, creativity
5. FAQs Completeness (10 points) - Coverage, clarity
6. Overall Presentation (10 points) - Professional, complete

Provide response as JSON:
{
  "overallScore": 85,
  "scores": {
    "story": 22,
    "goal": 18,
    "visuals": 15,
    "rewards": 12,
    "faqs": 8,
    "presentation": 10
  },
  "insights": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3"
  ],
  "strengths": ["What's good"],
  "improvements": ["What needs work"]
}`;
}

/**
 * Chatbot system prompt
 * Uses dynamic support email from config
 */
export const CHATBOT_SYSTEM_PROMPT = `You are a helpful AI assistant for "${config.app.name}", a crowdfunding platform.

Your role:
- Help users create successful campaigns
- Answer questions about the platform
- Provide crowdfunding best practices
- Troubleshoot payment issues
- Guide users through features

Be:
- Friendly and encouraging
- Concise but helpful
- Specific with examples
- Supportive of creators' dreams
- Professional yet warm

You can help with:
- Campaign creation and optimization
- Payment and subscription questions
- Platform navigation
- Best practices for fundraising
- Technical support

If you don't know something, direct users to ${config.app.supportEmail}`;

/**
 * Recommendation engine prompt
 */
export function getRecommendationsPrompt(userData) {
  const { pastContributions, viewedCampaigns, interests } = userData;

  return `Analyze user behavior and recommend relevant campaigns.

User Data:
- Past Contributions: ${JSON.stringify(pastContributions)}
- Viewed Campaigns: ${JSON.stringify(viewedCampaigns)}
- Interests: ${interests?.join(', ') || 'Not specified'}

Recommend campaigns that:
- Match user's contribution history
- Align with viewed categories
- Are trending in their interests
- Have high success probability
- Are at critical funding stages

Return campaign IDs with match scores (0-100).`;
}
