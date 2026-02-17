# Get Me A Chai - Project Overview & Component Structure

## 1. Project Overview

**Get Me A Chai** is a crowdfunding and patronage platform designed to help creators turn their creative projects into reality. It functions as a "Buy Me A Coffee" alternative, allowing supporters to make direct financial contributions to their favorite creators.

**Core Tech Stack:**
-   **Framework:** Next.js 14 (App Router)
-   **Structure:** React Components
-   **Icons:** React Icons (`fa`), Lucide React
-   **State:** React Hooks (`useState`, `useEffect`, `useRef`)
-   **Database:** MongoDB (Mongoose)
-   **Auth:** NextAuth.js
-   **Payments:** Razorpay

---

## 2. Component Structure by Page

### 2.1. Home Page (`app/page.js`)

#### **`ChaiScrollytelling.js`**
*   **Purpose:** Immersive hero section using canvas-based frame animation tied to scroll.
*   **Structure:**
    *   `<section>` Container (Height: `500vh`)
        *   `<div>` Sticky Container (Height: `100vh`, Top: `0`)
            *   `<canvas>` (Renders `.jpg` frames 1-200)
            *   `<div>` Text Overlay Wrapper
                *   **Overlay 1:** Hero Text ("Get Me a Chai") + Subtext ("Fund Dreams").
                *   **Overlay 2:** Value Proposition 1 ("Your bank account said no...").
                *   **Overlay 3:** Value Proposition 2 ("Not asking for investments...").
                *   **Overlay 4:** Final CTA with Button ("Start Your Campaign").

#### **`LiveStatsBar.js`**
*   **Purpose:** Floating ticker showing platform metrics.
*   **Structure:**
    *   `<div>` Wrapper
        *   `<div>` Card Container
            *   `<div>` Flex Container (Space Around)
                *   **Stat Item:** Repeat for each metric (Total Raised, Active Campaigns, etc.)
                    *   `<div>` Icon Wrapper
                    *   `<div>` Text Column
                        *   **Value:** Animated Number Counter
                        *   **Label:** Uppercase Metric Name

#### **`TrendingCampaigns.js`**
*   **Purpose:** Showcase of popular campaigns.
*   **Structure:**
    *   `<section>` Container
        *   `<div>` Header Row
            *   **Left:** Badge ("Trending Now") + Title ("Popular Campaigns") + Subtitle.
            *   **Right:** Navigation Buttons (Prev/Next Arrows).
        *   `<div>` Content Container
            *   **Desktop:** Grid Layout (3 Columns).
            *   **Mobile:** Carousel Layout (Flex Row) with Dot Indicators.
        *   **`CampaignCard` Component:**
            *   `<div>` Card Wrapper
                *   **Image Section:**
                    *   Background Image/Placeholder.
                    *   **Badges:** "Featured" (Top Left), Category Name (Top Right).
                    *   **Quick Stats:** Overlay at bottom (View Count, Supporter Count).
                *   **Content Section:**
                    *   **Creator Info:** Avatar + Username + Verified Icon.
                    *   **Title:** Campaign Name (Truncated).
                    *   **Description:** Short description text.
                    *   **Progress Bar:**
                        *   Text Row: Amount Raised (Left) + Percentage (Right).
                        *   Bar: Visual progress indicator.
                    *   **Footer:** Days Left + Goal Amount.
        *   `<div>` Footer Action
            *   Button: "View All Campaigns" (Links to `/explore`).

### 2.2. Dashboard (`app/dashboard/page.js`)

#### **`StatsCards.js`**
*   **Purpose:** High-level metrics grid.
*   **Structure:**
    *   `<div>` Header Row
        *   Title ("Overview").
        *   **Time Filter:** Toggle Buttons (Today / Week / Month / All-time).
    *   `<div>` Grid Container (1-4 Columns)
        *   **Card Item:** Repeated for Earnings, Campaigns, Supporters, Avg Donation.
            *   **Top Row:** Icon Box + Percentage Change Badge (Arrow Up/Down).
            *   **Middle:** Label Text.
            *   **Bottom:** Large Value Display + Comparison Text ("vs last week").

#### **`EarningsChart.js`**
*   **Purpose:** Visual graph of income over time.
*   **Structure:**
    *   `<div>` Container
        *   Title ("Earnings Overview").
        *   `<canvas>` / Chart Component (Line or Bar Chart).

#### **`RecentTransactions.js`**
*   **Purpose:** Table of latest payments.
*   **Structure:**
    *   `<div>` Container
        *   `<div>` Header: Title + "View All" Link.
        *   `<div>` Table Wrapper (Scrollable)
            *   `<table>`
                *   `<thead>`: Columns (Supporter, Campaign, Amount, Date, Status).
                *   `<tbody>`:
                    *   `<tr>` Row:
                        *   **Supporter:** Avatar + Name + Message.
                        *   **Campaign:** Campaign Title.
                        *   **Amount:** Currency Value.
                        *   **Date:** Relative Time (e.g., "2 hours ago").
                        *   **Status:** Status Badge (Success/Pending/Failed).
        *   `<div>` Pagination Footer (Prev / Next Buttons).

### 2.3. Explore Page (`app/explore/page.js`)

#### **`AdvancedSearch.js`**
*   **Purpose:** Search input with autocomplete.
*   **Structure:**
    *   `<div>` Search Container
        *   `<form>` Input Wrapper
            *   Icon: Search Magnifier.
            *   `<input>` Text Field (Placeholder: "Search campaigns...").
            *   **Controls:** Clear (X) Button + Submit Button.
        *   `<div>` Suggestions Dropdown (Conditional)
            *   **History Section:** List of recent searches with Clock Icon.
            *   **Suggestions Section:** List of AI/DB matches.

#### **`CampaignGrid.js`**
*   **Purpose:** grid of campaign results.
*   **Structure:**
    *   `<div>` Main Container
        *   **Grid Layout:** Responsive columns based on screen size.
        *   **Content States:**
            *   **Loading:** Skeleton Loader Cards (Pulse animation).
            *   **Error:** Error Message + Retry Button.
            *   **Empty:** "No results found" Icon + Text.
            *   **Success:** List of `<CampaignCard>` components.
        *   `<div>` Infinite Scroll Trigger (Sentinel element at bottom).

### 2.4. Campaign Profile (`app/campaign/[id]/page.js`)

#### **`CampaignHero.js`**
*   **Purpose:** Visual header for the campaign.
*   **Structure:**
    *   `<div>` Container
        *   **Background:** Large Cover Image.
        *   **Overlay:** Gradient for text readability.
        *   `<div>` Content Wrapper (Bottom aligned)
            *   **Profile Image:** Large Avatar with Border + Verified Badge.
            *   **Text Info:**
                *   Category Badge.
                *   Title (H1).
                *   **Meta Row:** "by" Creator Name + Username + Location + Date.

#### **`CampaignSidebar.js`**
*   **Purpose:** Sticky support/payment module.
*   **Structure:**
    *   `<div>` Sidebar Container (Sticky)
        *   **Progress Card:**
            *   **Value Row:** Amount Raised + Percentage.
            *   **Progress Bar:** Visual indicator.
            *   **Stats Row:** Supporter Count + Days Left.
        *   **Payment Form:**
            *   **Input:** Name Field.
            *   **Input:** Message Field.
            *   **Input:** Amount Field (with Currency Symbol).
            *   **Quick Buttons:** Grid of preset amounts (100, 500, 1000).
            *   **Action Button:** "Support This Campaign" (Triggers Payment Modal).
        *   **Creator Mini-Profile:**
            *   Title ("About Creator").
            *   **Stats List:** Total Raised, Total Supporters, Campaign Count.
            *   **Action:** "View Profile" Button.

### 2.5. Public Profile / Payment Page (`components/PaymentPage.js`)

#### **Payment Page Structure**
*   **Layout:** Two-Column Layout (Stack on Mobile).
*   **Header Section:**
    *   Cover Image (Full Width).
    *   Profile Picture (Overlapping).
    *   **Info Block:** Username + Verification + Bio + Global Stats Badge.
*   **Column 1 (Supporters Feed):**
    *   Title ("Top Supporters").
    *   **List Container:** Scrollable vertical list.
    *   **Supporter Item:** Avatar + Name/Amount Row + Message Text.
*   **Column 2 (Payment Widget):**
    *   Title ("Make a Payment").
    *   **Form:** Name, Message, Amount Inputs.
    *   **Presets:** Buttons for common amounts.
    *   **Submit:** "Pay Now" Button.

### 2.6. Auth Pages (`/login`, `/signup`)

#### **Auth Card Structure**
*   **Container:** Centered Modal-like Card.
*   **Header:** Logo/Icon + Greeting Title.
*   **Social Section:** "Continue with GitHub" Button.
*   **Divider:** "Or" separator with text.
*   **Form Section:**
    *   **Inputs:** Email, Password (plus Name/Confirm for Signup).
    *   **Extras:** "Forgot Password" Link (Login only).
    *   **Submit:** Primary Action Button ("Sign In" / "Create Account").
*   **Role Switcher (Signup Only):** Toggle buttons for "Creator" vs "Supporter".
*   **Footer:** Link to switch between Login/Signup.

### 2.7. About Page (`app/about/page.js`)

#### **About Page Sections**
*   **Hero Section:** Centered Heading + Subheading.
*   **Stats Strip:** Horizontal list of key platform metrics.
*   **Timeline:** Vertical list of milestones (Alternating Left/Right).
*   **Trust Indicators:** Grid of badges (Secure, Fast, Global).
*   **FAQ:** Accordion List (Click to expand answers).
