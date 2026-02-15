# How to Get Default Images for Your Campaign Categories

## Option 1: Use Free Stock Photo Sites (Recommended)

### Recommended Sites
1. **Unsplash** - https://unsplash.com (Free, high quality)
2. **Pexels** - https://pexels.com (Free, high quality)
3. **Pixabay** - https://pixabay.com (Free, CC0 license)

### Image Specifications
- **Size:** 1200x600px (2:1 ratio)
- **Format:** JPG or WebP
- **Quality:** High (at least 1920px width)

### Search Terms by Category

#### 1. Education
- Search: "education technology", "online learning", "books study"
- Style: Clean, modern, inspiring
- Colors: Blue, purple tones

#### 2. Fashion
- Search: "fashion design", "clothing style", "fashion runway"
- Style: Elegant, stylish, modern
- Colors: Pink, purple, gold tones

#### 3. Default/Other
- Search: "abstract gradient", "modern technology", "innovation"
- Style: Generic, professional, versatile
- Colors: Blue, purple gradient

---

## Option 2: Use AI Image Generators

### Free AI Tools
1. **Leonardo.ai** - https://leonardo.ai (Free tier available)
2. **Ideogram** - https://ideogram.ai (Free)
3. **Microsoft Designer** - https://designer.microsoft.com (Free)

### Prompts to Use

#### Education Image
```
Modern education and learning concept, books and digital technology, 
clean professional background, purple and blue gradient, 
inspiring atmosphere, 1200x600px banner
```

#### Fashion Image
```
Fashion and style concept, elegant clothing design, 
modern trendy aesthetic, pink and purple gradient, 
stylish professional banner, 1200x600px
```

#### Default/Other Image
```
Modern abstract technology background, innovation and creativity, 
blue and purple gradient, professional clean design, 
versatile campaign banner, 1200x600px
```

---

## Option 3: Use Canva (Easiest)

### Steps:
1. Go to https://canva.com
2. Create custom size: 1200 x 600 px
3. Use templates or create from scratch
4. Download as JPG

### Canva Template Ideas

#### Education
- Search: "Education Banner"
- Elements: Books, graduation cap, lightbulb
- Colors: Purple (#667eea), Blue (#4facfe)

#### Fashion
- Search: "Fashion Banner"
- Elements: Clothing, accessories, style icons
- Colors: Pink (#f093fb), Red (#f5576c)

#### Default
- Search: "Abstract Gradient Banner"
- Elements: Geometric shapes, gradients
- Colors: Blue (#4facfe), Cyan (#00f2fe)

---

## Option 4: Hire a Designer (Professional)

### Platforms
1. **Fiverr** - $5-$50 per image
2. **Upwork** - $10-$100 per image
3. **99designs** - Design contest

### What to Request
- 9 campaign category banners (1200x600px)
- 1 default profile picture (400x400px)
- 1 default cover picture (1200x300px)
- Modern, professional style
- Consistent color scheme

---

## Quick Setup Instructions

### Once You Have Images:

1. **Download/Save Images** with these names:
   ```
   education.jpg
   fashion.jpg
   default.jpg
   default-profilepic.jpg
   default-coverpic.jpg
   ```

2. **Place in Correct Folder:**
   ```
   public/images/campaigns/education.jpg
   public/images/campaigns/fashion.jpg
   public/images/campaigns/default.jpg
   public/images/default-profilepic.jpg
   public/images/default-coverpic.jpg
   ```

3. **Update defaultImages.js:**
   Replace `.svg` with `.jpg` for these files:
   ```javascript
   'education': '/images/campaigns/education.jpg',
   'fashion': '/images/campaigns/fashion.jpg',
   'other': '/images/campaigns/default.jpg'
   ```

4. **Delete SVG files** (optional):
   ```bash
   rm public/images/campaigns/education.svg
   rm public/images/campaigns/fashion.svg
   rm public/images/campaigns/default.svg
   rm public/images/default-profilepic.svg
   rm public/images/default-coverpic.svg
   ```

---

## Recommended: Quick Unsplash Download

I'll provide direct Unsplash links for each category:

### Education
https://unsplash.com/s/photos/education-technology
- Look for: Modern classroom, online learning, books with laptop
- Download: 1920x1080 or larger, crop to 1200x600

### Fashion
https://unsplash.com/s/photos/fashion-design
- Look for: Clothing rack, fashion design, style concept
- Download: 1920x1080 or larger, crop to 1200x600

### Default
https://unsplash.com/s/photos/abstract-gradient
- Look for: Blue/purple gradients, modern abstract
- Download: 1920x1080 or larger, crop to 1200x600

### Profile Picture
https://unsplash.com/s/photos/user-avatar
- Look for: Generic user silhouette, professional avatar
- Download: Square format, at least 400x400

### Cover Picture
https://unsplash.com/s/photos/abstract-banner
- Look for: Wide abstract banner, gradient background
- Download: 1920x600 or larger, crop to 1200x300

---

## Image Optimization

After downloading, optimize images:

### Online Tools
1. **TinyPNG** - https://tinypng.com
2. **Squoosh** - https://squoosh.app
3. **ImageOptim** - https://imageoptim.com

### Target Size
- Campaign images: < 200KB each
- Profile pic: < 50KB
- Cover pic: < 100KB

---

## Alternative: Keep SVGs

If you want to keep the SVG placeholders for now:

**Pros:**
- Already created and working
- Small file size
- Scalable to any size
- Easy to customize colors

**Cons:**
- Less visually appealing than photos
- Generic appearance
- May look "placeholder-ish"

**Recommendation:** Use SVGs temporarily, replace with real images when you have time.

---

## Need Help?

If you'd like me to:
1. Wait and try generating images again later
2. Create better SVG designs with more detail
3. Provide more specific image recommendations

Just let me know!

---

**Quick Action:** 
The SVGs I created will work fine as temporary placeholders. You can replace them with real images anytime by just dropping JPG files in the same location with the same names and updating the file extensions in `defaultImages.js`.
