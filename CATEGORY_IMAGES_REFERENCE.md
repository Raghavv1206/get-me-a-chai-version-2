# Category Default Images Reference

## Quick Reference Guide

This document shows which default image is used for each campaign category when no cover image is uploaded.

## Category → Image Mapping

| Category | Default Image | File Type | Description |
|----------|--------------|-----------|-------------|
| **💻 Technology** | `tech-1.jpg` | JPG | Technology/innovation themed image |
| **🎨 Art & Design** | `art-1.jpg` | JPG | Art & Design themed image |
| **🎵 Music** | `music-1.jpg` | JPG | Music themed image |
| **🎮 Games** | `game-1.jpg` | JPG | Gaming themed image |
| **🍕 Food & Beverage** | `food-1.jpg` | JPG | Food & Beverage themed image |
| **👗 Fashion** | `fashion.svg` | SVG | Fashion themed vector image |
| **📚 Education** | `education.svg` | SVG | Education themed vector image |
| **🎬 Film & Video** | `default.svg` | SVG | Generic fallback vector image |
| **🌟 Other** | `default.svg` | SVG | Generic fallback vector image |

## File Locations

All default images are stored in:
```
/public/images/campaigns/
```

Full paths:
- `/public/images/campaigns/tech-1.jpg`
- `/public/images/campaigns/art-1.jpg`
- `/public/images/campaigns/music-1.jpg`
- `/public/images/campaigns/game-1.jpg`
- `/public/images/campaigns/food-1.jpg`
- `/public/images/campaigns/fashion.svg`
- `/public/images/campaigns/education.svg`
- `/public/images/campaigns/default.svg`

## Usage in Code

### Import the utility
```javascript
import { resolveCoverImage, getCategoryDefaultImage } from '@/lib/categoryImages';
```

### Get category default image path
```javascript
const imagePath = getCategoryDefaultImage('technology');
// Returns: '/images/campaigns/tech-1.jpg'
```

### Resolve cover image (user-provided or default)
```javascript
const coverImage = resolveCoverImage(userProvidedImage, 'music');
// If userProvidedImage is empty: '/images/campaigns/music-1.jpg'
// If userProvidedImage has value: returns userProvidedImage
```

## Examples

### Example 1: Technology Campaign
```javascript
// User creates a Technology campaign without uploading an image
const campaign = {
    category: 'technology',
    coverImage: '' // empty
};

const finalImage = resolveCoverImage(campaign.coverImage, campaign.category);
// Result: '/images/campaigns/tech-1.jpg'
```

### Example 2: Music Campaign with Custom Image
```javascript
// User creates a Music campaign with a custom image
const campaign = {
    category: 'music',
    coverImage: 'https://example.com/my-band-photo.jpg'
};

const finalImage = resolveCoverImage(campaign.coverImage, campaign.category);
// Result: 'https://example.com/my-band-photo.jpg' (uses custom image)
```

### Example 3: Unknown Category
```javascript
// User creates a campaign with an unknown/invalid category
const campaign = {
    category: 'unknown-category',
    coverImage: ''
};

const finalImage = resolveCoverImage(campaign.coverImage, campaign.category);
// Result: '/images/campaigns/default.svg' (fallback)
```

## Adding New Categories

To add a new category with a default image:

1. **Add the image** to `/public/images/campaigns/`
2. **Update the mapping** in `lib/categoryImages.js`:
   ```javascript
   const categoryImageMap = {
       // ... existing mappings
       'new-category': '/images/campaigns/new-category-image.jpg',
   };
   ```
3. **Update this reference guide** with the new category

## Image Specifications

### Recommended Dimensions
- **JPG images**: 1200×630px (optimal for social sharing)
- **SVG images**: Scalable (no fixed dimensions needed)

### File Size
- Keep JPG files under 1MB for fast loading
- SVG files are typically very small (<100KB)

### Format
- Use JPG for photographic images
- Use SVG for illustrations/icons
- Ensure images are web-optimized

## Testing

To test the default images:

1. Create a new campaign
2. Select a specific category
3. Skip the Media step (don't upload a cover image)
4. Publish the campaign
5. Verify the correct category-specific image is displayed

## Troubleshooting

**Issue**: Default image not showing
- Check that the image file exists in `/public/images/campaigns/`
- Verify the category name matches exactly (case-sensitive)
- Check browser console for 404 errors

**Issue**: Wrong image for category
- Verify the mapping in `lib/categoryImages.js`
- Check that the category value is correct (lowercase)

**Issue**: Image path incorrect
- Ensure paths start with `/images/campaigns/` (not `/public/images/campaigns/`)
- Next.js serves files from `/public/` as root `/`
