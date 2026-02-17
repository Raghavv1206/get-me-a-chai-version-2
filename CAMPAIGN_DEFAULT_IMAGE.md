# Campaign Default Image Implementation

## Summary
Campaigns without uploaded images automatically use **category-specific default images** from the local `/public/images/campaigns/` folder. Each category has its own themed placeholder image for a more professional and relevant appearance.

## Changes Made

### 1. **Category Image Utility** (`lib/categoryImages.js`) - NEW ✨
Created a utility module with three main functions:
- `getCategoryDefaultImage(category)` - Returns the path to the category-specific default image
- `getCategoryDefaultImageUrl(category, baseUrl)` - Returns full URL for external use
- `resolveCoverImage(coverImage, category)` - Returns user image or category default

**Category to Image Mapping:**
```javascript
{
    'technology': '/images/campaigns/tech-1.jpg',
    'art': '/images/campaigns/art-1.jpg',
    'music': '/images/campaigns/music-1.jpg',
    'games': '/images/campaigns/game-1.jpg',
    'food': '/images/campaigns/food-1.jpg',
    'fashion': '/images/campaigns/fashion.svg',
    'education': '/images/campaigns/education.svg',
    'film': '/images/campaigns/default.svg',
    'other': '/images/campaigns/default.svg'
}
```

### 2. **MediaStep Component** (`components/campaign/MediaStep.js`)
✅ **Changed label**: "Cover Image URL *" → "Cover Image URL (Optional)"  
✅ **Removed validation**: Removed the `disabled` state from the Next button  
✅ **Added help text**: "If no image is provided, a default placeholder will be used"  
✅ **Result**: Users can now proceed through the campaign builder without uploading an image

### 3. **PreviewStep Component** (`components/campaign/PreviewStep.js`)
✅ **Added fallback UI**: Shows a placeholder box when no cover image is provided  
✅ **User feedback**: Displays message "📷 No cover image provided - A default placeholder will be used"  
✅ **Result**: Users are informed that their campaign will have a default image

### 4. **API Routes** (Updated to use category-based images)

**`app/api/campaigns/create/route.js`**:
```javascript
import { resolveCoverImage } from '@/lib/categoryImages';

// In campaign creation:
coverImage: resolveCoverImage(campaignData.coverImage, validatedData.category)
```

**`app/api/campaigns/draft/route.js`**:
```javascript
import { resolveCoverImage } from '@/lib/categoryImages';

// In draft creation:
coverImage: resolveCoverImage(campaignData.coverImage, campaignData.category || 'other')
```

## How It Works

1. **User creates campaign** and selects a category (e.g., "Technology")
2. **User skips adding a cover image** in the Media step
3. **MediaStep** allows user to proceed (no validation blocking)
4. **PreviewStep** shows placeholder message
5. **Backend** receives empty `coverImage` field and the selected category
6. **resolveCoverImage()** function checks:
   - If `coverImage` is provided → use it
   - If empty → return category-specific default (e.g., `/images/campaigns/tech-1.jpg`)
7. **Campaign is created** with the category-appropriate default image

## Available Default Images

Located in `/public/images/campaigns/`:
- `tech-1.jpg` - Technology/innovation themed
- `art-1.jpg` - Art & Design themed
- `music-1.jpg` - Music themed
- `game-1.jpg` - Gaming themed
- `food-1.jpg` - Food & Beverage themed
- `fashion.svg` - Fashion themed (vector)
- `education.svg` - Education themed (vector)
- `default.svg` - Generic fallback (vector)

## Testing Steps

To verify this works:
1. Navigate to `/dashboard/campaign/new`
2. Select a category (e.g., "Technology")
3. Fill out the basic campaign details
4. **Skip adding a cover image** in the Media step
5. Proceed to the Preview step
6. Verify you see the "No cover image provided" message
7. Publish the campaign
8. The campaign should be created with the **technology-themed** default image (`tech-1.jpg`)
9. Repeat with different categories to see different default images

## Benefits

✅ **Category-relevant defaults**: Each campaign gets a themed image matching its category  
✅ **Better UX**: Users aren't blocked from creating campaigns  
✅ **Professional appearance**: All campaigns have appropriate cover images  
✅ **Clear communication**: Users know a default will be used  
✅ **Local assets**: No dependency on external image services (Unsplash, etc.)  
✅ **Flexibility**: Users can add custom images later if they want  
✅ **Consistency**: Same default logic for both drafts and published campaigns  
✅ **Performance**: Local images load faster than external URLs

## Files Modified

1. `lib/categoryImages.js` - **NEW** - Category image mapping utility
2. `components/campaign/MediaStep.js` - Made cover image optional
3. `components/campaign/PreviewStep.js` - Added fallback UI for no image
4. `app/api/campaigns/create/route.js` - Uses `resolveCoverImage()` with category
5. `app/api/campaigns/draft/route.js` - Uses `resolveCoverImage()` with category

## Migration Notes

- **Old system**: Used a single Unsplash URL for all campaigns
- **New system**: Uses category-specific local images
- **Backward compatibility**: Existing campaigns with cover images are unaffected
- **Future campaigns**: Will automatically get category-appropriate defaults


