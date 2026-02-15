# Default Images System

## Overview
Comprehensive default image system for campaigns and users with category-based fallbacks and modern SVG placeholders.

---

## 📁 File Structure

```
public/images/
├── campaigns/
│   ├── tech-1.jpg          # Technology campaigns
│   ├── art-1.jpg           # Art & Design campaigns
│   ├── music-1.jpg         # Music campaigns
│   ├── film-1.jpg          # Film & Video campaigns
│   ├── game-1.jpg          # Games campaigns
│   ├── food-1.jpg          # Food & Beverage campaigns
│   ├── education.svg       # Education campaigns (SVG)
│   ├── fashion.svg         # Fashion campaigns (SVG)
│   └── default.svg         # Other/fallback (SVG)
├── default-profilepic.svg  # User profile picture
├── default-coverpic.svg    # User cover picture
└── tea.png                 # App icon/logo

lib/
└── defaultImages.js        # Utility functions
```

---

## 🎨 Default Images

### Campaign Images by Category

| Category | Image File | Type | Description |
|----------|-----------|------|-------------|
| **Technology** | `tech-1.jpg` | JPG | Tech/innovation themed |
| **Art & Design** | `art-1.jpg` | JPG | Creative/artistic themed |
| **Music** | `music-1.jpg` | JPG | Music/audio themed |
| **Film & Video** | `film-1.jpg` | JPG | Cinema/video themed |
| **Games** | `game-1.jpg` | JPG | Gaming themed |
| **Food & Beverage** | `food-1.jpg` | JPG | Food/culinary themed |
| **Education** | `education.svg` | SVG | Learning/education themed |
| **Fashion** | `fashion.svg` | SVG | Style/fashion themed |
| **Other** | `default.svg` | SVG | Generic fallback |

### User Images

| Type | Image File | Type | Description |
|------|-----------|------|-------------|
| **Profile Picture** | `default-profilepic.svg` | SVG | User avatar silhouette |
| **Cover Picture** | `default-coverpic.svg` | SVG | Profile banner |

---

## 🔧 Utility Functions

### Location
`lib/defaultImages.js`

### Available Functions

#### 1. `getDefaultCampaignImage(category)`
Get default campaign image based on category.

```javascript
import { getDefaultCampaignImage } from '@/lib/defaultImages';

const image = getDefaultCampaignImage('technology');
// Returns: '/images/campaigns/tech-1.jpg'

const fallback = getDefaultCampaignImage('invalid');
// Returns: '/images/campaigns/default.svg'
```

**Parameters:**
- `category` (string) - Campaign category name

**Returns:**
- (string) - Path to default image

---

#### 2. `getDefaultProfilePic()`
Get default user profile picture.

```javascript
import { getDefaultProfilePic } from '@/lib/defaultImages';

const profilePic = getDefaultProfilePic();
// Returns: '/images/default-profilepic.svg'
```

**Returns:**
- (string) - Path to default profile picture

---

#### 3. `getDefaultCoverPic()`
Get default user cover picture.

```javascript
import { getDefaultCoverPic } from '@/lib/defaultImages';

const coverPic = getDefaultCoverPic();
// Returns: '/images/default-coverpic.svg'
```

**Returns:**
- (string) - Path to default cover picture

---

#### 4. `getCampaignImageWithFallback(coverImage, category)`
Get campaign image with automatic fallback to default.

```javascript
import { getCampaignImageWithFallback } from '@/lib/defaultImages';

// With custom image
const image1 = getCampaignImageWithFallback('https://example.com/my-image.jpg', 'technology');
// Returns: 'https://example.com/my-image.jpg'

// Without custom image (uses default)
const image2 = getCampaignImageWithFallback(null, 'technology');
// Returns: '/images/campaigns/tech-1.jpg'

// Without custom image and invalid category
const image3 = getCampaignImageWithFallback(null, 'invalid');
// Returns: '/images/campaigns/default.svg'
```

**Parameters:**
- `coverImage` (string|null) - Campaign cover image URL
- `category` (string) - Campaign category for fallback

**Returns:**
- (string) - Image URL or default

---

#### 5. `getUserProfilePicWithFallback(profilepic)`
Get user profile picture with automatic fallback.

```javascript
import { getUserProfilePicWithFallback } from '@/lib/defaultImages';

// With custom image
const pic1 = getUserProfilePicWithFallback('https://example.com/avatar.jpg');
// Returns: 'https://example.com/avatar.jpg'

// Without custom image
const pic2 = getUserProfilePicWithFallback(null);
// Returns: '/images/default-profilepic.svg'
```

**Parameters:**
- `profilepic` (string|null) - User profile picture URL

**Returns:**
- (string) - Image URL or default

---

#### 6. `getUserCoverPicWithFallback(coverpic)`
Get user cover picture with automatic fallback.

```javascript
import { getUserCoverPicWithFallback } from '@/lib/defaultImages';

// With custom image
const cover1 = getUserCoverPicWithFallback('https://example.com/cover.jpg');
// Returns: 'https://example.com/cover.jpg'

// Without custom image
const cover2 = getUserCoverPicWithFallback(null);
// Returns: '/images/default-coverpic.svg'
```

**Parameters:**
- `coverpic` (string|null) - User cover picture URL

**Returns:**
- (string) - Image URL or default

---

#### 7. `getAllCampaignCategories()`
Get all campaign categories with their default images.

```javascript
import { getAllCampaignCategories } from '@/lib/defaultImages';

const categories = getAllCampaignCategories();
// Returns: [
//   { name: 'technology', label: 'Technology', image: '/images/campaigns/tech-1.jpg' },
//   { name: 'art', label: 'Art & Design', image: '/images/campaigns/art-1.jpg' },
//   ...
// ]
```

**Returns:**
- (Array) - Array of category objects with `name`, `label`, and `image`

---

#### 8. `validateImageUrl(url)`
Validate and sanitize image URL.

```javascript
import { validateImageUrl } from '@/lib/defaultImages';

const valid1 = validateImageUrl('/images/test.jpg');
// Returns: '/images/test.jpg'

const valid2 = validateImageUrl('https://example.com/image.jpg');
// Returns: 'https://example.com/image.jpg'

const invalid = validateImageUrl('invalid-url');
// Returns: null
```

**Parameters:**
- `url` (string) - Image URL to validate

**Returns:**
- (string|null) - Sanitized URL or null if invalid

---

## 💡 Usage Examples

### Example 1: Campaign Card Component

```javascript
import Image from 'next/image';
import { getCampaignImageWithFallback } from '@/lib/defaultImages';

export default function CampaignCard({ campaign }) {
    const imageUrl = getCampaignImageWithFallback(
        campaign.coverImage,
        campaign.category
    );

    return (
        <div className="campaign-card">
            <Image
                src={imageUrl}
                alt={campaign.title}
                width={400}
                height={300}
                className="campaign-image"
            />
            <h3>{campaign.title}</h3>
        </div>
    );
}
```

### Example 2: User Profile Component

```javascript
import Image from 'next/image';
import { getUserProfilePicWithFallback, getUserCoverPicWithFallback } from '@/lib/defaultImages';

export default function UserProfile({ user }) {
    const profilePic = getUserProfilePicWithFallback(user.profilepic);
    const coverPic = getUserCoverPicWithFallback(user.coverpic);

    return (
        <div className="user-profile">
            <Image
                src={coverPic}
                alt="Cover"
                width={1200}
                height={300}
                className="cover-image"
            />
            <Image
                src={profilePic}
                alt={user.name}
                width={150}
                height={150}
                className="profile-pic"
            />
            <h2>{user.name}</h2>
        </div>
    );
}
```

### Example 3: Category Selector

```javascript
import { getAllCampaignCategories } from '@/lib/defaultImages';

export default function CategorySelector({ onSelect }) {
    const categories = getAllCampaignCategories();

    return (
        <div className="category-grid">
            {categories.map(category => (
                <button
                    key={category.name}
                    onClick={() => onSelect(category.name)}
                    className="category-card"
                >
                    <img src={category.image} alt={category.label} />
                    <span>{category.label}</span>
                </button>
            ))}
        </div>
    );
}
```

---

## 🎨 SVG Image Specifications

### Campaign SVGs

#### Education (`education.svg`)
- **Size:** 1200x600px
- **Gradient:** Purple (#667eea) to Purple (#764ba2)
- **Theme:** Learning, growth, knowledge
- **Icon:** Book/graduation cap

#### Fashion (`fashion.svg`)
- **Size:** 1200x600px
- **Gradient:** Pink (#f093fb) to Red (#f5576c)
- **Theme:** Style, design, trends
- **Icon:** Dress/hanger

#### Default (`default.svg`)
- **Size:** 1200x600px
- **Gradient:** Blue (#4facfe) to Cyan (#00f2fe)
- **Theme:** Generic support
- **Icon:** Checkmark

### User SVGs

#### Profile Picture (`default-profilepic.svg`)
- **Size:** 400x400px
- **Gradient:** Purple (#667eea) to Purple (#764ba2)
- **Icon:** User silhouette (head + shoulders)
- **Shape:** Circular

#### Cover Picture (`default-coverpic.svg`)
- **Size:** 1200x300px
- **Gradient:** Purple (#667eea) to Purple (#764ba2) to Pink (#f093fb)
- **Elements:** Decorative circles and lines
- **Style:** Abstract, modern

---

## 🔄 Migration from Old Images

### What Was Changed

#### Deleted Files
- ❌ `public/images/default-profilepic.jpg`
- ❌ `public/images/default-coverpic.jpg`

#### New Files
- ✅ `public/images/default-profilepic.svg`
- ✅ `public/images/default-coverpic.svg`
- ✅ `public/images/campaigns/education.svg`
- ✅ `public/images/campaigns/fashion.svg`
- ✅ `public/images/campaigns/default.svg`
- ✅ `lib/defaultImages.js`

### Benefits of SVG

1. **Scalability** - Perfect quality at any size
2. **Small File Size** - Much smaller than JPG/PNG
3. **Customizable** - Easy to modify colors/elements
4. **Performance** - Faster loading
5. **Accessibility** - Better for screen readers

---

## 🚀 Integration Checklist

### For Existing Components

Update components to use the new utility functions:

- [ ] Campaign cards
- [ ] Campaign detail pages
- [ ] User profiles
- [ ] User avatars
- [ ] Category selectors
- [ ] Search results
- [ ] Dashboard components

### Example Migration

**Before:**
```javascript
<Image
    src={campaign.coverImage || '/images/campaigns/default.jpg'}
    alt={campaign.title}
/>
```

**After:**
```javascript
import { getCampaignImageWithFallback } from '@/lib/defaultImages';

<Image
    src={getCampaignImageWithFallback(campaign.coverImage, campaign.category)}
    alt={campaign.title}
/>
```

---

## 📝 Best Practices

### 1. Always Use Fallback Functions
```javascript
// ✅ Good
const image = getCampaignImageWithFallback(campaign.coverImage, campaign.category);

// ❌ Bad
const image = campaign.coverImage || '/images/default.jpg';
```

### 2. Validate User-Uploaded Images
```javascript
import { validateImageUrl } from '@/lib/defaultImages';

const imageUrl = validateImageUrl(userInput);
if (!imageUrl) {
    // Handle invalid URL
}
```

### 3. Use Next.js Image Component
```javascript
import Image from 'next/image';

<Image
    src={imageUrl}
    alt="Description"
    width={400}
    height={300}
    priority={isAboveFold}
/>
```

### 4. Provide Alt Text
```javascript
<Image
    src={profilePic}
    alt={`${user.name}'s profile picture`}  // ✅ Descriptive
    // alt="Profile"  // ❌ Too generic
/>
```

---

## 🐛 Troubleshooting

### Image Not Displaying

**Problem:** Default image not showing

**Solution:**
1. Check file exists in `public/images/`
2. Verify path starts with `/images/`
3. Check browser console for 404 errors
4. Clear Next.js cache: `rm -rf .next`

### Wrong Category Image

**Problem:** Wrong default image for category

**Solution:**
1. Verify category name matches enum in Campaign model
2. Check `getDefaultCampaignImage()` mapping
3. Ensure category is lowercase

### SVG Not Rendering

**Problem:** SVG appears broken

**Solution:**
1. Check SVG syntax is valid
2. Verify `xmlns="http://www.w3.org/2000/svg"` attribute
3. Test SVG in browser directly
4. Check for special characters in SVG

---

## 🔮 Future Enhancements

### Planned Features
1. **Dynamic Color Themes** - Generate SVGs with user's brand colors
2. **Multiple Variants** - Different styles per category
3. **Animated SVGs** - Subtle animations for engagement
4. **WebP Support** - Modern image format for JPGs
5. **Lazy Loading** - Optimize performance
6. **Image CDN** - Use CDN for faster delivery

### Adding New Categories

To add a new campaign category:

1. **Add to Campaign Model**
```javascript
// models/Campaign.js
enum: ['technology', 'art', 'music', ..., 'newcategory']
```

2. **Add Image**
```bash
# Add image to public/images/campaigns/
newcategory.jpg  # or .svg
```

3. **Update defaultImages.js**
```javascript
const categoryMap = {
    // ...
    'newcategory': '/images/campaigns/newcategory.jpg'
};
```

4. **Update getAllCampaignCategories()**
```javascript
{ name: 'newcategory', label: 'New Category', image: '/images/campaigns/newcategory.jpg' }
```

---

**Status:** ✅ COMPLETE
**Version:** 1.0.0
**Last Updated:** 2026-02-14
**Maintainer:** Development Team
