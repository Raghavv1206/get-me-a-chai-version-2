---
description: How to style dashboard components with Tailwind CSS and Dark Theme
---

When styling dashboard components, follow these guidelines to ensure consistency with the premium dark theme:

1. **Structure & Layout**
   - Use `flex` or `grid` for layouts.
   - Ensure the Sidebar is fixed (`fixed left-0`) or sticky.
   - Main content should have a left margin (`ml-72` for desktop, `ml-0` for mobile) to accommodate the sidebar.
   - Use `min-h-screen` and `bg-black` for the main wrapper.

2. **Colors & Theme**
   - **Backgrounds**: Use `bg-black` for the page background.
   - **Cards/Containers**: Use `bg-white/5` with `backdrop-blur-xl` for a glassmorphism effect.
   - **Borders**: Use `border-white/10` for subtle separation.
   - **Text**: 
     - Headings: `text-white`
     - Secondary text: `text-gray-400` or `text-gray-500`
     - Accents: `text-purple-400`, `text-blue-400`, `text-green-400`, etc.

3. **Charts (Recharts)**
   - Use `ResponsiveContainer` for fluid sizing.
   - Style generic components (Axes, Grids) with subtle colors (e.g., `stroke="#6b7280"`).
   - Use gradients in `defs` for Area charts to create a premium look.
   - Custom Tooltips: Create a custom component returning a `div` with `bg-black/90`, `backdrop-blur`, and `border-white/10`.

4. **Interactive Elements**
   - **Buttons/Links**: Add hover effects like `hover:bg-white/10` or `hover:text-white`.
   - **Transitions**: Use `transition-all duration-200` for smooth interactions.
   - **Focus States**: Ensure focus rings are visible but aligned with the theme (e.g., `focus:ring-purple-500`).

5. **Responsiveness**
   - Hide/Show elements using `hidden` and `block`/`flex` with breakpoints (`sm:`, `lg:`).
   - Adjust paddings and font sizes for mobile.
   - Ensure the sidebar can be toggled on mobile (using a state variable like `isMobileOpen`).

6. **Icons**
   - Use `react-icons` (e.g., `FaHome`, `FaUser`) for consistent iconography.
   - Wrap icons in a container with a subtle background (`bg-purple-500/10`) and textual color (`text-purple-400`) for visual pop.

Example Card Structure:
```jsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-white font-bold">Title</h3>
    <Icon className="text-purple-400" />
  </div>
  <div className="text-2xl font-bold text-white">Value</div>
</div>
```
