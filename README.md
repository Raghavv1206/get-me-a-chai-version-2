# ☕ Get Me a Chai - AI-Powered Crowdfunding Platform

<div align="center">

**Where Every Cup of Chai Fuels a Dream ☕✨**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![DeepSeek AI](https://img.shields.io/badge/DeepSeek-AI_Powered-FF6B35?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C68FF?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

[🚀 Live Demo](https://get-me-a-chai.vercel.app) • [🐛 Report Bug](https://github.com/Raghavv1206/get-me-a-chai-version-2/issues) • [✨ Request Feature](https://github.com/Raghavv1206/get-me-a-chai-version-2/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Get Me a Chai** is a full-stack, AI-powered crowdfunding platform that empowers creators to fund their projects — one chai at a time. Built with **Next.js 15**, **React 19**, **MongoDB**, and **DeepSeek AI**, it delivers a premium experience with AI-driven campaign creation, real-time analytics, Razorpay-integrated payments, and intelligent recommendations.

### ☕ Why Get Me a Chai?

- 🤖 **AI-Powered Campaign Builder**: DeepSeek AI generates stories, milestones, rewards, FAQs, and quality scores
- 💳 **Razorpay Payments**: Secure one-time & recurring subscription payments with per-creator credentials
- 📊 **Advanced Analytics**: Real-time traffic sources, device breakdown, conversion funnels, and geographic data
- 🔍 **Smart Search & Discovery**: AI-powered recommendations, advanced filters, and category exploration
- 🤝 **Creator-Supporter Ecosystem**: Follow system, threaded comments, supporter badges, and thank-you templates
- 🛡️ **AI Content Moderation**: Automated campaign moderation with fraud detection and quality scoring
- 💬 **AI Chatbot Assistant**: Platform-wide conversational AI for creator guidance and support
- 📧 **Automated Email System**: Transactional emails, weekly summaries, and notification preferences
- 🎨 **Immersive Landing Page**: Canvas-based scrollytelling animation with scroll-snapping

---

## ✨ Features

### 🤖 AI-Powered Campaign Builder
```
✅ AI campaign story generation with hook, problem, solution, and CTA sections
✅ Intelligent funding goal suggestions with cost breakdown analysis
✅ Auto-generated milestones (25%, 50%, 75%, 100%) with deliverables
✅ AI-crafted reward tiers from ₹100 to ₹5000+ with delivery estimates
✅ AI FAQ generation covering funds usage, timeline, refunds, and risks
✅ Campaign quality scoring (0-100) with multi-dimensional feedback
✅ Multi-step campaign creation wizard (Basic Info → Story → Media → Milestones → Rewards → FAQs → Preview)
✅ Powered by DeepSeek AI via OpenRouter with streaming support
```

### 💳 Payment & Subscription System
```
✅ Razorpay payment gateway with INR currency support
✅ Per-creator Razorpay credentials (stored securely in DB, no global keys)
✅ One-time contributions with custom amounts (₹1 – ₹99,99,999)
✅ Recurring subscriptions (monthly, quarterly, yearly)
✅ Anonymous donations with hidden amounts
✅ Reward-tier-based contributions with limited quantity tracking
✅ Payment verification with order ID and payment ID validation
✅ Real-time milestone progression and auto-completion on goal reach
✅ Supporter messages with each contribution
✅ Payment success page with confetti celebrations
```

### 📊 Advanced Analytics Dashboard
```
✅ Real-time visitor tracking with daily/weekly/monthly views
✅ Revenue charts with earnings over time
✅ Traffic source classification (direct, social, search, referral, email)
✅ Device breakdown analysis (mobile, desktop, tablet)
✅ Geographic distribution of supporters
✅ Conversion funnel visualization (views → clicks → conversions)
✅ Peak hours analysis for optimal engagement
✅ Supporter demographics breakdown
✅ AI-powered insights panel with actionable recommendations
✅ Export reports as PDF, CSV, and Excel (XLSX)
```

### 🔍 Search, Discovery & Exploration
```
✅ Global search modal with keyboard shortcut (Ctrl+K / ⌘+K)
✅ Advanced search with filters (category, status, funding range, date)
✅ Smart search suggestions with real-time results
✅ Category-based browsing (Technology, Art, Music, Film, Education, Games, Food, Fashion)
✅ Filter sidebar with sort options (trending, newest, most funded, ending soon)
✅ Grid/List view toggle for campaign browsing
✅ Saved campaigns with bookmarking
✅ AI-powered personalized recommendations based on viewing history
✅ Trending campaigns section on landing page
✅ Campaign map view
```

### 💬 AI Chatbot Assistant
```
✅ Platform-wide floating chatbot widget (lazy-loaded)
✅ Multi-turn conversation with history retention
✅ Campaign creation guidance and best practices
✅ Payment troubleshooting and platform navigation help
✅ Streaming responses for real-time feedback
✅ Suggested quick actions for common queries
✅ Context-aware responses using platform knowledge
✅ Powered by DeepSeek AI with custom system prompts
```

### 🤝 Creator & Supporter Ecosystem
```
✅ Public creator profiles with bio, social links, and stats
✅ Follow/unfollow system with follower notifications
✅ Supporter management dashboard with filters and search
✅ Top supporters leaderboard
✅ Supporter details modal with contribution history
✅ Customizable thank-you message templates
✅ Bulk actions for supporter management
✅ Contribution badges system (First Backer, Top Supporter, etc.)
✅ Contribution timeline with visual history
✅ "My Contributions" page for supporters
```

### 📝 Campaign Content & Updates
```
✅ Rich text editor (Tiptap) with image embeds and links
✅ Campaign updates (public and supporters-only visibility)
✅ Scheduled publishing for updates
✅ Update cards with views and likes tracking
✅ Draft, published, and scheduled update statuses
✅ Campaign update notifications to followers
✅ Content preview before publishing
```

### 🔔 Notification System
```
✅ Real-time in-app notification bell with unread count
✅ 9 notification types: payment, milestone, comment, update, system, campaign, subscription, follow, reply
✅ Granular notification preferences (per-type, per-channel)
✅ Email + In-App dual notification channels
✅ Notification frequency: realtime, daily, or weekly digest
✅ Notification filters by type and read status
✅ Mark all as read functionality
✅ Newsletter subscription toggle
```

### 📧 Automated Email System
```
✅ Welcome email for new users
✅ Payment confirmation receipts for supporters
✅ Creator notification on receiving payments
✅ Milestone achievement celebration emails
✅ Campaign update notifications
✅ Weekly performance summary emails with AI insights
✅ Professional HTML email templates with responsive design
✅ Unsubscribe links with one-click opt-out
✅ SMTP integration (Gmail, custom providers)
```

### 🛡️ Admin Panel & Moderation
```
✅ Admin dashboard with platform-wide stats (users, campaigns, revenue)
✅ User management (search, filter by role, verify, ban)
✅ Campaign moderation queue with approve/reject workflow
✅ AI-powered content moderation for automated review
✅ Report system (spam, fraud, misleading, harassment, IP violation)
✅ Report resolution with admin notes
✅ Role-based access control (creator, supporter, admin)
✅ Route-level middleware protection for admin/dashboard pages
```

### 🎨 Landing Page & UI
```
✅ Canvas-based scrollytelling animation (ChaiScrollytelling)
✅ Scroll-snapping with frame-by-frame animation
✅ Animated hero section with call-to-action
✅ Live platform stats bar (total raised, campaigns, supporters)
✅ Trending campaigns carousel
✅ "How It Works" section with step-by-step guide
✅ Platform features showcase
✅ Success stories section
✅ Category exploration grid
✅ CTA section with sign-up prompt
✅ Dark theme with ambient background effects (purple/blue gradients)
✅ Smooth scroll with Lenis
✅ Route progress bar for page transitions
✅ Framer Motion animations throughout
✅ Responsive design (mobile, tablet, desktop)
```

### ⚙️ Cron Jobs & Automation
```
✅ Weekly summary email cron (Mondays at 9 AM)
✅ Scheduled content publishing cron (daily midnight)
✅ Auto-close expired campaigns
✅ CampaignView TTL cleanup (auto-delete after 90 days)
✅ Vercel Cron integration for production
```

### 🔐 Authentication & Security
```
✅ NextAuth.js v4 with JWT strategy (30-day sessions)
✅ GitHub OAuth provider
✅ Email/password credentials with bcrypt hashing
✅ Demo account for testing
✅ Password strength indicator
✅ Password reset via email token
✅ Auto-redirect for authenticated users on login/signup pages
✅ Rate limiting (auth: 5/15min, API: 100/15min, general: 1000/15min)
✅ Input validation with Zod schemas
✅ Middleware-based route protection
✅ Centralized configuration with env validation on startup
✅ Feature flags for toggling platform capabilities
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td width="50%" valign="top">

### Frontend
```yaml
Framework:      Next.js 15.5 (App Router)
UI Library:     React 19.1
Language:       JavaScript (ES6+)
Styling:        Tailwind CSS 4.x
Build Tool:     Next.js built-in (SWC)

Animations:
  - Framer Motion 11.x
  - Canvas API (scrollytelling)
  - Lenis (smooth scroll)

Charts:
  - Chart.js 4.5 + react-chartjs-2
  - Recharts 2.15

Rich Text:
  - Tiptap Editor (React)
  - Extension: Image, Link

UI Components:
  - Lucide React (icons)
  - React Icons 5.x
  - React Toastify 11.x
  - React Day Picker 9.x
  - Canvas Confetti 1.x

State:          React Hooks + Server Actions
Routing:        Next.js App Router (file-based)
Font:           Inter (Google Fonts)
```

</td>
<td width="50%" valign="top">

### Backend
```yaml
Runtime:        Node.js (Next.js API Routes)
Framework:      Next.js 15.5 (Server Components)
Database:       MongoDB 8.x (Mongoose 8.17)
Auth:           NextAuth.js 4.24 (JWT)
                GitHub OAuth + Credentials

AI Services:
  - OpenRouter API (DeepSeek Chat)
  - Streaming + Non-streaming modes
  - Multi-turn conversation support

Payments:
  - Razorpay 2.9 (INR)
  - Per-creator credentials
  - Subscriptions support

Email:
  - Nodemailer 7.x
  - Custom HTML templates
  - SMTP (Gmail compatible)

Exports:
  - jsPDF 4.0 (PDF reports)
  - PapaParse 5.5 (CSV)
  - SheetJS (XLSX/Excel)

Security:
  - bcryptjs 3.x (password hashing)
  - Zod 3.x (validation)
  - Rate limiting (custom)
  - Middleware route protection

Utilities:
  - date-fns 3.6
  - Sharp 0.33 (image processing)
  - react-markdown + remark-gfm
```

</td>
</tr>
</table>

### Infrastructure & DevOps
```
Hosting:             Vercel (Serverless Functions + Edge)
Database Hosting:    MongoDB Atlas
Cron Jobs:           Vercel Cron (weekly-summary, publish-scheduled, close-expired)
CDN:                 Vercel Edge Network
Version Control:     Git + GitHub
```

---

## 🏗️ Architecture

### System Design
```mermaid
graph TB
    A[Next.js App Router<br/>React 19 + Tailwind 4] -->|Server Actions<br/>API Routes| B[Next.js Backend<br/>API Routes + Server Components]
    
    B --> C[Campaign Service]
    B --> D[Analytics Service]
    B --> E[AI Engine]
    B --> F[Payment Service]
    B --> G[Notification Service]
    B --> H[Email Service]
    
    C --> I[(MongoDB Atlas<br/>Mongoose 8.x)]
    D --> I
    F --> I
    G --> I
    
    E --> J[OpenRouter API<br/>DeepSeek Chat]
    
    F --> K[Razorpay API<br/>Payments + Subscriptions]
    
    H --> L[SMTP Server<br/>Nodemailer]
    
    D --> M[Analytics Engine<br/>Traffic, Devices, Geo]
    
    B --> N[NextAuth.js<br/>JWT + GitHub OAuth]
    
    B --> O[Cron Jobs<br/>Vercel Cron]
    O --> P[Weekly Summary<br/>Publish Scheduled<br/>Close Expired]
    
    style A fill:#0a82a3
    style B fill:#000000
    style I fill:#47A248
    style J fill:#FF6B35
    style K fill:#0C68FF
    style L fill:#EA4335
    style N fill:#7C3AED
```

### Landing Page Architecture
```mermaid
graph LR
    A[HeroSection] --> B[ChaiScrollytelling<br/>Canvas Animation]
    B --> C[LiveStatsBar]
    C --> D[TrendingCampaigns]
    D --> E[PlatformFeatures]
    E --> F[HowItWorksSection]
    F --> G[CategoriesSection]
    G --> H[SuccessStories]
    H --> I[CTASection]
    I --> J[Footer]
    
    style B fill:#7C3AED
```

### Dashboard Architecture
```mermaid
graph TB
    A[Dashboard Layout] --> B[DashboardSidebar]
    A --> C[StatsCards]
    A --> D[EarningsChart]
    A --> E[CampaignPerformance]
    A --> F[RecentTransactions]
    A --> G[RecentActivity]
    A --> H[QuickActions]
    
    A --> I["/dashboard/campaigns"]
    A --> J["/dashboard/analytics"]
    A --> K["/dashboard/content"]
    A --> L["/dashboard/supporters"]
    A --> M["/dashboard/settings"]
    A --> N["/dashboard/create-campaign"]
    A --> O["/dashboard/campaign/:id"]
    
    style A fill:#1a1a2e
```

---

## 🗄️ Database Schema

```sql
-- 👤 Users
User
  - email, name, username, password (bcrypt)
  - profilepic, coverpic, bio, location
  - role (creator/supporter/admin)
  - verified (Boolean)
  - razorpayid, razorpaysecret (per-creator)
  - socialLinks { twitter, linkedin, github, website }
  - stats { totalRaised, totalSupporters, campaignsCount, successRate }
  - notificationPreferences { email{}, inApp{}, frequency, newsletter }
  - resetPasswordToken, resetPasswordExpire

-- 🎯 Campaigns
Campaign
  - creator (ref → User), username
  - title, slug (unique), category (9 types), projectType
  - brief, hook, shortDescription, story, aiGenerated
  - goalAmount, currentAmount, currency (INR)
  - coverImage, images[], videoUrl
  - startDate, endDate
  - milestones[] { title, amount, description, completed, completedAt }
  - rewards[] { title, amount, description, deliveryTime, limitedQuantity, claimedCount }
  - faqs[] { question, answer }
  - status (draft/active/paused/completed/cancelled)
  - featured, verified
  - stats { views, supporters, shares, comments }
  - qualityScore (0-100, AI-generated)
  - location, tags[]
  - Virtuals: progress, daysRemaining, isExpired

-- 💰 Payments
Payment
  - name, email, userId (ref → User)
  - to_user, campaign (ref → Campaign)
  - oid (Razorpay Order ID), paymentId
  - amount, currency, message
  - rewardTier, type (one-time/subscription)
  - anonymous, hideAmount
  - status (pending/success/failed/refunded)
  - notifiedAt (duplicate prevention)

-- 🔄 Subscriptions
Subscription
  - subscriber (ref → User), creator (ref → User)
  - campaign (ref → Campaign)
  - razorpaySubscriptionId, amount
  - frequency (monthly/quarterly/yearly)
  - status (active/paused/cancelled/expired)
  - nextBillingDate, startDate, endDate

-- 📊 Analytics
Analytics
  - campaign (ref → Campaign), date
  - eventType (visit/click/conversion/share)
  - source (direct/social/search/referral/email)
  - referrer, utmSource, utmMedium, utmCampaign
  - device (mobile/desktop/tablet)
  - amount, userId, metadata

-- 👁️ Campaign Views (TTL: 90 days auto-delete)
CampaignView
  - userId (ref → User), campaignId (ref → Campaign)
  - viewedAt (TTL index)
  - Unique compound index: userId + campaignId

-- 💬 Comments (Threaded)
Comment
  - campaign (ref → Campaign), user (ref → User)
  - content, parentComment (ref → Comment)
  - likes, pinned, deleted

-- 📢 Campaign Updates
CampaignUpdate
  - campaign (ref → Campaign), creator (ref → User)
  - title, content, images[]
  - visibility (public/supporters-only)
  - status (draft/published/scheduled)
  - publishDate, scheduledFor
  - stats { views, likes }

-- 🔔 Notifications (9 types)
Notification
  - user (ref → User)
  - type (payment/milestone/comment/update/system/campaign/subscription/follow/reply)
  - title, message, link
  - payment, campaign, relatedUser (refs)
  - metadata, read, readAt

-- 🚩 Reports (Moderation)
Report
  - targetType (campaign/comment/user), targetId
  - reporter (ref → User)
  - reason (spam/fraud/misleading/inappropriate/harassment/IP/other)
  - description, status (pending/reviewing/resolved/dismissed)
  - resolution, resolvedBy, resolvedAt
  - Unique: targetType + targetId + reporter
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **MongoDB 6+** (local or MongoDB Atlas)
- **Git**
- **OpenRouter API Key** ([Get one here](https://openrouter.ai/))
- **Razorpay Account** ([Sign up](https://razorpay.com/)) *(per-creator, optional for dev)*
- **GitHub OAuth App** ([Create one](https://github.com/settings/developers)) *(optional)*

### 📂 Repository Structure
```
get-me-a-chai/
├── app/                        # Next.js App Router pages
│   ├── [username]/             # Public user profile
│   ├── about/                  # About page
│   ├── admin/                  # Admin dashboard & moderation
│   │   └── moderation/         # Content moderation queue
│   ├── api/                    # API routes (17 route groups)
│   │   ├── admin/              # Admin endpoints
│   │   ├── ai/                 # AI endpoints (10 routes)
│   │   │   ├── chat/           # Chatbot conversations
│   │   │   ├── generate-campaign/  # Campaign story generation
│   │   │   ├── generate-faqs/     # FAQ generation
│   │   │   ├── generate-milestones/ # Milestone generation
│   │   │   ├── generate-rewards/   # Reward tier generation
│   │   │   ├── insights/       # AI analytics insights
│   │   │   ├── moderate/       # AI content moderation
│   │   │   ├── recommendations/ # Personalized recommendations
│   │   │   ├── score-campaign/ # Quality scoring
│   │   │   └── suggest-goal/   # Goal suggestion
│   │   ├── analytics/          # Analytics tracking
│   │   ├── auth/               # NextAuth handlers
│   │   ├── campaigns/          # Campaign CRUD
│   │   ├── cron/               # Scheduled jobs (3)
│   │   ├── email/              # Email endpoints
│   │   ├── follow/             # Follow/unfollow
│   │   ├── notifications/      # Notification endpoints
│   │   ├── payments/           # Payment create/verify
│   │   ├── razorpay/           # Razorpay integration
│   │   ├── search/             # Search API
│   │   ├── stats/              # Platform stats
│   │   ├── subscription/       # Subscription management
│   │   ├── supporters/         # Supporter data
│   │   └── user/               # User profile
│   ├── campaign/[id]/          # Campaign detail page
│   ├── dashboard/              # Creator dashboard
│   │   ├── analytics/          # Analytics dashboard
│   │   ├── campaign/           # Campaign management
│   │   ├── campaigns/          # Campaign list
│   │   ├── content/            # Content/updates management
│   │   ├── create-campaign/    # Campaign builder wizard
│   │   ├── settings/           # Account settings
│   │   └── supporters/         # Supporter management
│   ├── explore/                # Browse campaigns
│   ├── login/                  # Login page
│   ├── my-contributions/       # Supporter's contribution history
│   ├── notifications/          # Notification center
│   ├── payment-success/        # Post-payment celebration
│   ├── signup/                 # Registration page
│   ├── stories/                # Success stories
│   └── unsubscribe/            # Email unsubscribe
│
├── actions/                    # Next.js Server Actions (10 files)
│   ├── adminActions.js         # Admin operations
│   ├── analyticsActions.js     # Analytics tracking
│   ├── campaignActions.js      # Campaign CRUD
│   ├── contentActions.js       # Content management
│   ├── contributionsActions.js # Contribution tracking
│   ├── emailActions.js         # Email sending
│   ├── moderationActions.js    # Moderation workflows
│   ├── notificationActions.js  # Notification management
│   ├── searchActions.js        # Search & discovery
│   └── useractions.js          # User & payment actions
│
├── components/                 # React components (32 subdirs, 14 files)
│   ├── about/                  # About page sections (7)
│   ├── admin/                  # Admin components (3)
│   ├── analytics/              # Analytics components (11)
│   ├── auth/                   # Auth components (1)
│   ├── campaign/               # Campaign components (10+)
│   │   ├── CampaignBuilderWizard.js  # Multi-step wizard
│   │   ├── AIStoryStep.js      # AI story generation step
│   │   ├── BasicInfoStep.js    # Campaign info step
│   │   ├── MediaStep.js        # Image/video upload step
│   │   ├── MilestonesStep.js   # Milestones step
│   │   ├── RewardsStep.js      # Reward tiers step
│   │   ├── FAQsStep.js         # FAQs step
│   │   ├── PreviewStep.js      # Final preview step
│   │   └── payment/            # Payment flow
│   ├── chatbot/                # AI chatbot (6)
│   ├── content/                # Content management (7)
│   ├── contributions/          # Contribution tracking (3)
│   ├── dashboard/              # Dashboard widgets (12)
│   ├── home/                   # Landing page sections (9)
│   ├── layout/                 # Layout components
│   ├── moderation/             # Moderation UI (2)
│   ├── notifications/          # Notification UI (4)
│   ├── recommendations/        # AI recommendations (2)
│   ├── search/                 # Search components (8)
│   ├── subscription/           # Subscription UI (2)
│   ├── supporters/             # Supporter management (7)
│   └── ui/                     # Shared UI components
│
├── models/                     # Mongoose schemas (10)
├── lib/                        # Shared libraries
│   ├── ai/                     # AI integration (OpenRouter + prompts)
│   ├── email/                  # Email service (Nodemailer + 7 templates)
│   ├── auth.js                 # NextAuth configuration
│   ├── config.js               # Centralized config management
│   ├── logger.js               # Structured logging
│   ├── rateLimit.js            # Rate limiting
│   ├── validation.js           # Zod validation schemas
│   └── notifications.js        # Notification engine
│
├── hooks/                      # Custom React hooks
├── db/                         # Database connection
├── middleware.js                # Route protection middleware
├── public/                     # Static assets & animations
│   └── frames/                 # Scrollytelling animation frames
│
├── vercel.json                 # Vercel cron configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Raghavv1206/get-me-a-chai-version-2.git
cd get-me-a-chai-version-2
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# Required — Application
NEXT_PUBLIC_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key  # openssl rand -base64 32

# Required — Database
MONGO_URI=mongodb://localhost:27017/get-me-a-chai
# Or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Required — AI
OPENROUTER_API_KEY=your_openrouter_api_key  # https://openrouter.ai/

# Optional — OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# Optional — Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# Optional — Demo Account
DEMO_EMAIL=demo@getmeachai.com
DEMO_PASSWORD=demo123456
DEMO_ENABLED=true
```

> See [`.env.example`](.env.example) for all 80+ configurable environment variables.

### 4️⃣ Start Development Server
```bash
npm run dev
```

### 5️⃣ Access Application

| Service | URL | Description |
|---------|-----|-------------|
| **App** | http://localhost:3000 | Main application |
| **Dashboard** | http://localhost:3000/dashboard | Creator dashboard (requires login) |
| **Admin** | http://localhost:3000/admin | Admin panel (admin role required) |
| **Explore** | http://localhost:3000/explore | Browse campaigns |
| **Stories** | http://localhost:3000/stories | Success stories |

### 6️⃣ Quick Start Guide

#### Create Your First Campaign

1. **Sign Up** at http://localhost:3000/signup (or use demo account)
2. Navigate to **Dashboard** → **Create Campaign**
3. Follow the **7-step wizard**:
   - **Step 1**: Enter title, category, goal, and dates
   - **Step 2**: Write or **AI-generate** your campaign story
   - **Step 3**: Upload cover image and media
   - **Step 4**: Add milestones (or generate with AI)
   - **Step 5**: Set reward tiers (or generate with AI)
   - **Step 6**: Add FAQs (or generate with AI)
   - **Step 7**: Preview and publish!
4. Your campaign is live at `/campaign/{id}`

#### Support a Campaign

1. Browse campaigns at **/explore** or search with **Ctrl+K**
2. Click on a campaign to view details
3. Choose an amount or select a reward tier
4. Complete payment through **Razorpay** checkout
5. Celebrate on the payment success page! 🎉

#### Set Up Razorpay (For Creators)

1. Go to **Dashboard** → **Settings**
2. Enter your **Razorpay Key ID** and **Key Secret**
3. Save — you're ready to receive payments!

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production:  https://get-me-a-chai.vercel.app/api
```

### Authentication
All protected endpoints require NextAuth.js session (JWT cookie-based).

### API Routes Overview

#### 🔐 Authentication
```http
POST   /api/auth/[...nextauth]     # NextAuth handler (login, callback, session)
POST   /api/check-user             # Check if username/email exists
```

#### 👤 User Management
```http
GET    /api/user                   # Get user profile
PATCH  /api/user                   # Update user profile & settings
POST   /api/follow                 # Follow/unfollow a creator
```

#### 🎯 Campaign Management
```http
GET    /api/campaigns              # List campaigns (with filters)
POST   /api/campaigns              # Create new campaign
GET    /api/campaigns/[id]         # Get campaign details
PATCH  /api/campaigns/[id]         # Update campaign
DELETE /api/campaigns/[id]         # Delete campaign
```

#### 🤖 AI Engine (10 Endpoints)
```http
POST   /api/ai/generate-campaign   # Generate campaign story with AI
POST   /api/ai/suggest-goal        # Get AI goal suggestion
POST   /api/ai/generate-milestones # Generate milestones
POST   /api/ai/generate-rewards    # Generate reward tiers
POST   /api/ai/generate-faqs       # Generate FAQs
POST   /api/ai/score-campaign      # Get AI quality score (0-100)
POST   /api/ai/chat                # Chatbot conversation (streaming)
POST   /api/ai/moderate            # AI content moderation
POST   /api/ai/insights            # AI analytics insights
POST   /api/ai/recommendations     # Personalized recommendations
```

#### 💳 Payments
```http
POST   /api/payments/create        # Create Razorpay order
POST   /api/payments/verify        # Verify payment signature
POST   /api/payments/subscription  # Create subscription
GET    /api/razorpay               # Get Razorpay config
```

#### 📊 Analytics
```http
POST   /api/analytics              # Track analytics event
GET    /api/analytics              # Get campaign analytics
GET    /api/stats                  # Get platform-wide stats
```

#### 🔍 Search
```http
GET    /api/search                 # Search campaigns, users, categories
GET    /api/search/suggestions     # Get search suggestions
```

#### 🔔 Notifications
```http
GET    /api/notifications          # Get user notifications
PATCH  /api/notifications          # Mark as read
DELETE /api/notifications          # Delete notification
```

#### 📧 Email
```http
POST   /api/email                  # Send transactional email
POST   /api/subscription           # Manage email subscriptions
```

#### 🤝 Supporters
```http
GET    /api/supporters             # Get campaign supporters
GET    /api/supporters/[id]        # Get supporter details
```

#### 🛡️ Admin
```http
GET    /api/admin/stats            # Platform statistics
GET    /api/admin/users            # List all users
PATCH  /api/admin/users/[id]       # Update user (verify, ban, role)
GET    /api/admin/campaigns        # List all campaigns
PATCH  /api/admin/campaigns/[id]   # Moderate campaign (approve/reject)
```

#### ⏰ Cron Jobs
```http
POST   /api/cron/weekly-summary        # Send weekly summary emails
POST   /api/cron/publish-scheduled     # Publish scheduled updates
POST   /api/cron/close-expired-campaigns # Auto-close expired campaigns
```

---

<!-- ## 📸 Screenshots

<div align="center">

### ☕ Immersive Landing Page
![Landing Page](https://via.placeholder.com/900x500/0a0a0a/ffffff?text=Scrollytelling+Animation+%2B+Dark+Theme)
*Canvas-based scrollytelling with chai animation, scroll-snapping, and ambient effects*

---

### 🎯 Campaign Builder Wizard
![Campaign Builder](https://via.placeholder.com/900x500/0a0a0a/ffffff?text=7-Step+AI+Campaign+Builder)
*Multi-step wizard with AI story generation, milestones, rewards, and quality scoring*

---

### 📊 Analytics Dashboard
![Analytics](https://via.placeholder.com/900x500/0a0a0a/ffffff?text=Real-Time+Analytics+Dashboard)
*Traffic sources, device breakdown, conversion funnel, revenue charts, and AI insights*

---

### 🔍 Explore & Search
![Explore](https://via.placeholder.com/900x500/0a0a0a/ffffff?text=Explore+Campaigns+%2B+Advanced+Filters)
*Category browsing, advanced search, filter sidebar, and grid/list view toggle*

---

### 💳 Payment Flow
![Payment](https://via.placeholder.com/900x500/0a0a0a/ffffff?text=Razorpay+Payment+%2B+Reward+Tiers)
*Secure Razorpay checkout with reward tier selection and anonymous donation support*

---

### 🤖 AI Chatbot
![Chatbot](https://via.placeholder.com/900x500/0a0a0a/ffffff?text=AI+Chatbot+Assistant)
*Platform-wide AI chatbot with multi-turn conversations and suggested actions*

---

### 🛡️ Admin Panel
![Admin](https://via.placeholder.com/900x500/0a0a0a/ffffff?text=Admin+Dashboard+%2B+Moderation)
*Platform stats, user management, campaign moderation, and report resolution*

</div>

--- -->

## 🔮 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Next.js 15 App Router with React 19
- [x] MongoDB database with Mongoose ODM
- [x] NextAuth.js authentication (GitHub OAuth + Credentials)
- [x] Campaign CRUD with multi-step creation wizard
- [x] Razorpay payment integration (one-time + subscriptions)
- [x] Public creator profiles with social links
- [x] Dark theme with ambient effects

### ✅ Phase 2: AI Integration (Completed)
- [x] DeepSeek AI via OpenRouter integration
- [x] AI campaign story generator
- [x] AI milestone, reward, and FAQ generation
- [x] AI quality scoring (0-100 multi-dimensional)
- [x] AI funding goal suggestions
- [x] AI chatbot assistant with streaming
- [x] AI content moderation
- [x] AI-powered personalized recommendations

### ✅ Phase 3: Analytics & Engagement (Completed)
- [x] Real-time analytics dashboard (11 components)
- [x] Traffic source classification
- [x] Device and geographic breakdown
- [x] Conversion funnel visualization
- [x] AI insights panel
- [x] Export reports (PDF, CSV, Excel)
- [x] Follow/unfollow system
- [x] Threaded comments with likes and pinning
- [x] Supporter management with filters and bulk actions
- [x] Contribution badges and timeline
- [x] Notification system (9 types, in-app + email)

### ✅ Phase 4: Platform Polish (Completed)
- [x] Canvas scrollytelling landing page animation
- [x] Global search modal (Ctrl+K)
- [x] Advanced search with filter sidebar
- [x] Explore page with category browsing
- [x] Success stories page
- [x] About page with team, timeline, FAQ, and trust badges
- [x] Admin panel with moderation queue
- [x] Automated email system (7 templates)
- [x] Cron jobs (weekly summary, scheduled publishing, campaign expiry)
- [x] Rate limiting and security hardening
- [x] Feature flags system
- [x] Centralized configuration management

### 🔄 Phase 5: Enhancement (In Progress)
- [ ] Google OAuth integration
- [ ] Image upload to cloud storage (Cloudinary)
- [ ] Push notifications (Web Push API)
- [ ] Real-time WebSocket updates
- [ ] Campaign sharing with OG image generation
- [ ] Two-factor authentication (2FA)
- [ ] Mobile app (React Native)

### 📅 Phase 6: Scale (Planned)
- [ ] Multi-currency support (USD, EUR, GBP)
- [ ] Payment gateway alternatives (Stripe, PayPal)
- [ ] Internationalization (i18n) — Hindi, Tamil, Telugu
- [ ] Campaign analytics API for creators
- [ ] Webhook integrations (Slack, Discord)
- [ ] Advanced fraud detection ML models
- [ ] GraphQL API layer
- [ ] Redis caching for performance

**💡 Have ideas?** [Open a feature request](https://github.com/Raghavv1206/get-me-a-chai-version-2/issues/new)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make Get Me a Chai better:

### 🐛 Found a Bug?

1. Check if the issue already exists in [GitHub Issues](https://github.com/Raghavv1206/get-me-a-chai-version-2/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected behavior vs actual behavior
   - Screenshots (if applicable)
   - Your environment (OS, Node.js version, browser)

### ✨ Want to Add a Feature?

1. Open an issue to discuss the feature first
2. Describe:
   - What problem it solves
   - Your proposed solution
   - Any alternative approaches considered

### 💻 Ready to Code?

1. **Fork the repository**
```bash
git clone https://github.com/your-username/get-me-a-chai-version-2.git
cd get-me-a-chai-version-2
git checkout -b feature/your-amazing-feature
```

2. **Set up development environment**
   - Follow the [Getting Started](#-getting-started) guide
   - Create a new branch for your feature
   - Make your changes

3. **Code style guidelines**
   - **JavaScript**: ES6+ with consistent formatting
   - **Components**: Functional components with hooks
   - **Styling**: Tailwind CSS utility classes
   - **Commits**: Write clear, descriptive commit messages
   - **Server Actions**: Use `'use server'` directive appropriately

4. **Test your changes**
```bash
# Run linting
npm run lint

# Run dev server and test manually
npm run dev
```

5. **Submit Pull Request**
   - Push your branch to your fork
   - Create PR against `main` branch
   - Describe your changes clearly
   - Link related issues
   - Wait for review

### 📝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Follow the [Contributor Covenant](https://www.contributor-covenant.org/)

### 🎯 Good First Issues

Look for issues labeled `good first issue` or `help wanted` to get started!

---

## 📞 Contact & Support

<div align="center">

### 🔗 Project Links

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Raghavv1206/get-me-a-chai-version-2)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://get-me-a-chai.vercel.app)

---

**Made with ☕ and ❤️ by [Raghav](https://github.com/Raghavv1206)**

*Every dream deserves a chai. Start funding yours today.*

</div>
