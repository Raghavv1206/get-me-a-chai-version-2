# AI Recommendations Engine - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │  Home Page   │  │ Explore Page │  │  Payment Success Page        │  │
│  │              │  │              │  │                              │  │
│  │  - Shows     │  │  - Category  │  │  - Success Message           │  │
│  │    Recs for  │  │    Filters   │  │  - AI Recommendations        │  │
│  │    Logged-in │  │  - Sidebar   │  │  - Action Buttons            │  │
│  │    Users     │  │    with Recs │  │  - Fade-in Animation         │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────────┘  │
│         │                 │                      │                       │
│         └─────────────────┴──────────────────────┘                       │
│                           │                                              │
│                           ▼                                              │
│              ┌────────────────────────────┐                              │
│              │  RecommendationFeed.js     │                              │
│              │  ┌──────────────────────┐  │                              │
│              │  │ - Session Check      │  │                              │
│              │  │ - Fetch Recs API     │  │                              │
│              │  │ - Refresh Button     │  │                              │
│              │  │ - Loading States     │  │                              │
│              │  └──────────────────────┘  │                              │
│              └────────────┬───────────────┘                              │
│                           │                                              │
│                           ▼                                              │
│              ┌────────────────────────────┐                              │
│              │  RecommendationCard.js     │                              │
│              │  ┌──────────────────────┐  │                              │
│              │  │ - Match Score (%)    │  │                              │
│              │  │ - Tooltip (Why?)     │  │                              │
│              │  │ - Progress Bar       │  │                              │
│              │  │ - Campaign Stats     │  │                              │
│              │  └──────────────────────┘  │                              │
│              └────────────────────────────┘                              │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

                                  │
                                  ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVER ACTIONS LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────┐    ┌─────────────────────────────────┐  │
│  │  getRecommendations()      │    │  trackView()                    │  │
│  │  ┌──────────────────────┐  │    │  ┌───────────────────────────┐  │  │
│  │  │ - Fetch from API     │  │    │  │ - Track campaign views    │  │  │
│  │  │ - No caching         │  │    │  │ - Call track-view API     │  │  │
│  │  │ - Error handling     │  │    │  │ - Error handling          │  │  │
│  │  └──────────────────────┘  │    │  └───────────────────────────┘  │  │
│  └────────────┬───────────────┘    └──────────────┬──────────────────┘  │
│               │                                    │                     │
└───────────────┼────────────────────────────────────┼─────────────────────┘
                │                                    │
                ▼                                    ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                           API ROUTES LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  GET /api/ai/recommendations                                    │    │
│  │  ┌───────────────────────────────────────────────────────────┐  │    │
│  │  │  ALGORITHM LOGIC:                                          │  │    │
│  │  │  1. Get user session (authentication)                      │  │    │
│  │  │  2. Fetch user's payment history (last 20)                 │  │    │
│  │  │  3. Extract category preferences                           │  │    │
│  │  │                                                             │  │    │
│  │  │  IF user has contribution history:                         │  │    │
│  │  │    - Find active campaigns in user's categories            │  │    │
│  │  │    - Exclude user's own campaigns                          │  │    │
│  │  │    - Sort by views + recency                               │  │    │
│  │  │  ELSE (new user):                                          │  │    │
│  │  │    - Show trending campaigns                               │  │    │
│  │  │    - Sort by views + featured status                       │  │    │
│  │  │                                                             │  │    │
│  │  │  4. Calculate match scores:                                │  │    │
│  │  │     - Base: 50                                             │  │    │
│  │  │     - Category match: +30                                  │  │    │
│  │  │     - Featured: +10                                        │  │    │
│  │  │     - High engagement (>100 views): +10                    │  │    │
│  │  │                                                             │  │    │
│  │  │  5. Add recommendation reasons                             │  │    │
│  │  │  6. Return top 6 campaigns                                 │  │    │
│  │  └───────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  POST /api/campaigns/track-view                                 │    │
│  │  ┌───────────────────────────────────────────────────────────┐  │    │
│  │  │  1. Receive campaignId                                     │  │    │
│  │  │  2. Increment campaign view count                          │  │    │
│  │  │  3. IF user is logged in:                                  │  │    │
│  │  │       - Create CampaignView record                         │  │    │
│  │  │       - Store userId, campaignId, timestamp                │  │    │
│  │  │  4. Return success                                         │  │    │
│  │  └───────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐    │
│  │  Campaign Model  │  │  Payment Model   │  │  CampaignView      │    │
│  │                  │  │                  │  │  Model             │    │
│  │  - title         │  │  - from_user     │  │                    │    │
│  │  - category      │  │  - to_campaign   │  │  - userId          │    │
│  │  - goalAmount    │  │  - amount        │  │  - campaignId      │    │
│  │  - currentAmount │  │  - createdAt     │  │  - viewedAt        │    │
│  │  - stats.views   │  │                  │  │                    │    │
│  │  - stats.support │  │                  │  │  Indexes:          │    │
│  │  - featured      │  │                  │  │  - userId +        │    │
│  │  - status        │  │                  │  │    campaignId      │    │
│  │  - creator       │  │                  │  │  - userId +        │    │
│  │                  │  │                  │  │    viewedAt        │    │
│  │                  │  │                  │  │  - TTL: 90 days    │    │
│  └──────────────────┘  └──────────────────┘  └────────────────────┘    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  User Visits Page                                                        │
│       │                                                                   │
│       ▼                                                                   │
│  RecommendationFeed checks session                                       │
│       │                                                                   │
│       ├─ Not logged in ──► Hide component                                │
│       │                                                                   │
│       └─ Logged in ──► Fetch recommendations                             │
│                              │                                            │
│                              ▼                                            │
│                    GET /api/ai/recommendations                           │
│                              │                                            │
│                              ├─ Query user's payments                    │
│                              ├─ Extract categories                       │
│                              ├─ Find matching campaigns                  │
│                              ├─ Calculate match scores                   │
│                              └─ Return recommendations                   │
│                                        │                                  │
│                                        ▼                                  │
│                              Display RecommendationCards                 │
│                                        │                                  │
│                                        ▼                                  │
│  User clicks campaign ──► Track view ──► POST /api/campaigns/track-view │
│                                                  │                        │
│                                                  ├─ Increment views       │
│                                                  └─ Store CampaignView    │
│                                                                           │
│  User makes payment ──► Payment success ──► Show recommendations         │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                     RECOMMENDATION ALGORITHM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  INPUT: User ID (from session)                                           │
│                                                                           │
│  STEP 1: Analyze User Profile                                            │
│    ├─ Fetch payment history (last 20 payments)                           │
│    ├─ Extract contributed campaign categories                            │
│    └─ Build user interest profile                                        │
│                                                                           │
│  STEP 2: Find Candidate Campaigns                                        │
│    ├─ IF user has history:                                               │
│    │    └─ Find active campaigns in user's categories                    │
│    └─ ELSE (new user):                                                   │
│         └─ Find trending active campaigns                                │
│                                                                           │
│  STEP 3: Filter Campaigns                                                │
│    ├─ Exclude user's own campaigns                                       │
│    ├─ Only include active status                                         │
│    └─ Sort by views and recency                                          │
│                                                                           │
│  STEP 4: Calculate Match Scores                                          │
│    ├─ Base score: 50                                                     │
│    ├─ Category match: +30                                                │
│    ├─ Featured campaign: +10                                             │
│    ├─ High engagement (>100 views): +10                                  │
│    └─ Max score: 100                                                     │
│                                                                           │
│  STEP 5: Generate Reasons                                                │
│    ├─ Category match: "Based on your interest in [category]"             │
│    └─ Trending: "Trending campaign"                                      │
│                                                                           │
│  STEP 6: Sort and Limit                                                  │
│    ├─ Sort by match score (descending)                                   │
│    └─ Return top 6 campaigns                                             │
│                                                                           │
│  OUTPUT: Array of recommended campaigns with scores and reasons          │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
get-me-a-chai/
├── app/
│   ├── page.js (✅ Updated - Added RecommendationFeed)
│   ├── explore/
│   │   └── page.js (✅ New - Explore page with sidebar)
│   ├── payment-success/
│   │   └── page.js (✅ New - Success page with recommendations)
│   └── api/
│       ├── ai/
│       │   └── recommendations/
│       │       └── route.js (✅ New - Recommendations API)
│       ├── campaigns/
│       │   └── track-view/
│       │       └── route.js (✅ New - View tracking API)
│       └── razorpay/
│           └── route.js (✅ Updated - Redirect to success page)
│
├── components/
│   └── recommendations/
│       ├── RecommendationFeed.js (✅ New)
│       └── RecommendationCard.js (✅ New)
│
├── lib/
│   └── actions/
│       ├── trackView.js (✅ New)
│       └── getRecommendations.js (✅ New)
│
├── models/
│   └── CampaignView.js (✅ New)
│
└── docs/
    ├── AI-RECOMMENDATIONS-ENGINE.md (✅ New - Full documentation)
    └── AI-RECOMMENDATIONS-COMPLETION.md (✅ New - Task completion report)
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTEGRATION MAP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. HOME PAGE (app/page.js)                                     │
│     └─ After TrendingCampaigns                                  │
│        └─ RecommendationFeed (logged-in users only)             │
│                                                                  │
│  2. EXPLORE PAGE (app/explore/page.js)                          │
│     └─ Sidebar (sticky on desktop)                              │
│        └─ RecommendationFeed                                    │
│                                                                  │
│  3. PAYMENT SUCCESS (app/payment-success/page.js)               │
│     └─ After success message                                    │
│        └─ RecommendationFeed (with fade-in animation)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Architecture Documentation*
*Last Updated: 2026-01-24*
