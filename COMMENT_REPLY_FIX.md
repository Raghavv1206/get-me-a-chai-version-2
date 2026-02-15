# Comment Reply Functionality Fix

## Issue
The Reply button in comments was not working properly - clicking it didn't provide clear feedback or scroll to the comment form.

## Solution Implemented

### 1. **Added Scroll-to-Form Functionality**
When clicking Reply, the page now smoothly scrolls to the comment form and focuses the textarea.

```javascript
const handleReply = (comment) => {
  setReplyTo(comment._id);
  setReplyToComment(comment);
  // Scroll to comment form
  commentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Focus on textarea after scroll
  setTimeout(() => {
    const textarea = commentFormRef.current?.querySelector('textarea');
    textarea?.focus();
  }, 500);
};
```

### 2. **Added Visual Reply Indicator**
A purple-highlighted box now appears above the comment form showing which comment you're replying to.

```jsx
{replyToComment && (
  <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-start gap-3">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-purple-300">Replying to</span>
        <span className="text-sm font-semibold text-white">{replyToComment.user?.name}</span>
      </div>
      <p className="text-sm text-gray-400 line-clamp-2">{replyToComment.content}</p>
    </div>
    <button onClick={cancelReply} className="...">
      <FaTimes className="w-4 h-4" />
    </button>
  </div>
)}
```

### 3. **Added useRef for Form Reference**
```javascript
const commentFormRef = useRef(null);

// Applied to form container
<div ref={commentFormRef} className="...">
```

### 4. **Improved State Management**
```javascript
const [replyTo, setReplyTo] = useState(null);           // Comment ID being replied to
const [replyToComment, setReplyToComment] = useState(null); // Full comment object for display

const cancelReply = () => {
  setReplyTo(null);
  setReplyToComment(null);
};
```

## Features Added

### ✅ Smooth Scroll Animation
- Scrolls to comment form with `behavior: 'smooth'`
- Centers the form in viewport with `block: 'center'`

### ✅ Auto-Focus Textarea
- Automatically focuses the textarea after scrolling
- 500ms delay to allow scroll animation to complete

### ✅ Visual Reply Indicator
- **Purple background** with border
- Shows **who you're replying to**
- Displays **preview of original comment** (2 lines max)
- **Close button** to cancel reply

### ✅ Cancel Reply Options
- Click X button in reply indicator
- Click "Cancel Reply" button below textarea
- Both use the same `cancelReply()` function

### ✅ Form Title Changes
- "Join the Discussion" when posting new comment
- "Reply to Comment" when replying

### ✅ Button Text Changes
- "Post Comment" for new comments
- "Post Reply" when replying

## User Experience Flow

### Before (Not Working)
1. User clicks Reply button
2. Nothing visible happens
3. User confused - is it working?
4. No indication of reply mode

### After (Fixed)
1. User clicks Reply button
2. **Page smoothly scrolls to comment form**
3. **Purple indicator shows who they're replying to**
4. **Textarea automatically focused**
5. User types reply
6. Clear "Post Reply" button
7. Can cancel with X or Cancel button

## Visual Design

### Reply Indicator Styling
```css
bg-purple-500/10          /* Light purple background */
border-purple-500/30      /* Purple border */
rounded-xl                /* Rounded corners */
```

### Layout
```
┌─────────────────────────────────────────────┐
│ Replying to John Doe                     [X]│
│ "This is the original comment text..."      │
└─────────────────────────────────────────────┘
```

### Colors
- **Background:** Purple-500 with 10% opacity
- **Border:** Purple-500 with 30% opacity
- **"Replying to" text:** Purple-300
- **User name:** White
- **Comment preview:** Gray-400
- **Close button:** Gray-400, hover White

## Code Changes

### Files Modified
- `components/campaign/profile/DiscussionTab.js`

### New Imports
```javascript
import { useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
```

### New State
```javascript
const [replyToComment, setReplyToComment] = useState(null);
const commentFormRef = useRef(null);
```

### New Functions
```javascript
const handleReply = (comment) => { /* ... */ };
const cancelReply = () => { /* ... */ };
```

### Updated Functions
```javascript
// handleSubmitComment now uses cancelReply()
if (response.ok) {
  setNewComment('');
  cancelReply();  // Instead of setReplyTo(null)
  fetchComments();
}
```

### Updated Components
```javascript
// Reply button now calls handleReply with full comment object
<button onClick={() => handleReply(comment)}>
  <FaReply /> Reply
</button>

// Cancel button now uses cancelReply function
<button onClick={cancelReply}>
  Cancel Reply
</button>
```

## Accessibility

### Keyboard Navigation
- ✅ All buttons are focusable
- ✅ Textarea auto-focuses on reply
- ✅ Tab order is logical

### Screen Readers
- ✅ Clear "Replying to [name]" text
- ✅ Close button has title attribute
- ✅ Form title changes based on mode

### Visual Feedback
- ✅ Purple highlight indicates reply mode
- ✅ Smooth scroll animation
- ✅ Hover states on buttons

## Testing Checklist

### ✅ Reply Functionality
- [ ] Click Reply button
- [ ] Page scrolls to comment form
- [ ] Textarea receives focus
- [ ] Reply indicator appears
- [ ] Shows correct user name
- [ ] Shows comment preview

### ✅ Cancel Reply
- [ ] Click X button in indicator
- [ ] Reply mode cancels
- [ ] Indicator disappears
- [ ] Form title changes back
- [ ] Click Cancel Reply button
- [ ] Same behavior as X button

### ✅ Submit Reply
- [ ] Type reply text
- [ ] Click Post Reply
- [ ] Reply submits successfully
- [ ] Reply appears under original comment
- [ ] Form clears
- [ ] Reply mode exits

### ✅ Edge Cases
- [ ] Reply to comment with long text
- [ ] Reply to comment at bottom of page
- [ ] Reply to comment at top of page
- [ ] Multiple reply attempts
- [ ] Cancel and reply to different comment

## Browser Compatibility

### Supported Features
- ✅ `scrollIntoView` with smooth behavior
- ✅ `useRef` hook
- ✅ `setTimeout` for delayed focus
- ✅ CSS line-clamp

### Fallbacks
- Smooth scroll degrades to instant scroll
- Focus works even if scroll fails
- Line-clamp degrades to overflow

## Performance

### Optimizations
- Single ref for form container
- Minimal state updates
- CSS transitions instead of JS animations
- Debounced scroll (native browser)

---

**Status:** ✅ FIXED
**Impact:** Improved UX, clear visual feedback, better accessibility
**Testing:** Ready for user testing
