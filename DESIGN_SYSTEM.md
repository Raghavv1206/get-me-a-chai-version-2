# Design System - GetMeAChai

## Overview
This document outlines the design system used across the GetMeAChai platform, ensuring consistent UI/UX across all pages.

## Color Palette

### Background
- **Primary Background**: `bg-black` - Pure black for main backgrounds
- **Card Background**: `bg-gray-900/50` - Semi-transparent dark gray with glassmorphism
- **Hover States**: `bg-white/5` to `bg-white/10` - Subtle white overlay

### Text
- **Primary Text**: `text-white` - Headings and important text
- **Secondary Text**: `text-gray-400` - Body text and descriptions
- **Muted Text**: `text-gray-500` - Less important information

### Accent Colors
- **Primary Accent**: Purple (`purple-500`, `purple-600`)
- **Secondary Accent**: Blue (`blue-500`, `blue-600`)
- **Success**: Green (`green-500`)
- **Warning**: Yellow (`yellow-500`)
- **Error**: Red (`red-500`, `red-400`)

### Borders
- **Default**: `border-white/10` - Subtle white borders
- **Hover**: `border-purple-500/30` to `border-purple-500/50`

## Typography

### Headings
- **H1**: `text-3xl sm:text-4xl md:text-5xl font-bold text-white`
- **H2**: `text-2xl sm:text-3xl font-bold text-white`
- **H3**: `text-xl font-bold text-white`

### Body Text
- **Large**: `text-lg text-gray-400`
- **Default**: `text-base text-gray-400`
- **Small**: `text-sm text-gray-400`
- **Extra Small**: `text-xs text-gray-500`

## Components

### Cards
```jsx
<div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl p-6">
  {/* Card content */}
</div>
```

**Variants:**
- **Hover Effect**: Add `hover:border-purple-500/30 hover:shadow-2xl transition-all`
- **Gradient**: Add `bg-gradient-to-br from-gray-900/50 to-gray-800/50`

### Buttons

#### Primary Button
```jsx
<button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
  Button Text
</button>
```

#### Secondary Button
```jsx
<button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-purple-500/50 rounded-xl transition-all">
  Button Text
</button>
```

#### Danger Button
```jsx
<button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all">
  Delete
</button>
```

### Inputs
```jsx
<input 
  type="text"
  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
  placeholder="Enter text..."
/>
```

## Layout

### Page Structure
```jsx
<div className="min-h-screen bg-black text-gray-100">
  {/* Ambient Effects */}
  <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
  <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
  
  <main className="pt-20 px-4 md:px-8 pb-8 relative">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page content */}
    </div>
  </main>
</div>
```

### Spacing
- **Container Padding**: `px-4 md:px-8`
- **Top Padding**: `pt-20` (to account for fixed navbar)
- **Section Spacing**: `space-y-6` or `gap-6`
- **Card Padding**: `p-6` (default), `p-4` (compact), `p-8` (large)

## Effects

### Glassmorphism
```jsx
className="backdrop-blur-sm bg-gray-900/50"
```

### Ambient Glow
```jsx
{/* Purple glow - top right */}
<div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

{/* Blue glow - bottom left */}
<div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
```

### Shadows
- **Default**: `shadow-xl`
- **Hover**: `shadow-2xl`
- **Colored**: `shadow-purple-500/10`

### Transitions
- **Default**: `transition-all duration-200`
- **Slow**: `transition-all duration-300`
- **Colors Only**: `transition-colors duration-200`

## Border Radius
- **Small**: `rounded-lg` (8px)
- **Default**: `rounded-xl` (12px)
- **Large**: `rounded-2xl` (16px)
- **Full**: `rounded-full` (circle/pill)

## Usage Examples

### Page Header
```jsx
<div className="mb-8">
  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
    Page Title
  </h1>
  <p className="text-lg text-gray-400">
    Page description goes here
  </p>
</div>
```

### Stats Card
```jsx
<div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-gray-400">Total Revenue</span>
    <span className="text-xs text-green-400">+12%</span>
  </div>
  <p className="text-3xl font-bold text-white">₹45,231</p>
</div>
```

### Badge
```jsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
  Featured
</span>
```

## Reusable Components

### PageLayout
Use the `PageLayout` component for consistent page structure:
```jsx
import PageLayout from '@/components/layout/PageLayout';

<PageLayout 
  title="Page Title"
  description="Page description"
  showAmbientEffects={true}
>
  {/* Your content */}
</PageLayout>
```

### Card
Use the `Card` component for consistent card styling:
```jsx
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card hover gradient>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

## Best Practices

1. **Always use dark theme** - All pages should have `bg-black` background
2. **Add ambient effects** - Include the purple and blue blur effects for depth
3. **Use glassmorphism** - Cards should have `backdrop-blur-sm` and semi-transparent backgrounds
4. **Consistent spacing** - Use Tailwind's spacing scale (4, 6, 8, etc.)
5. **Smooth transitions** - Add transitions to interactive elements
6. **Proper contrast** - Ensure text is readable against dark backgrounds
7. **Responsive design** - Use responsive classes (sm:, md:, lg:)
8. **Hover states** - All interactive elements should have clear hover states

## Accessibility

- Maintain proper color contrast ratios
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
