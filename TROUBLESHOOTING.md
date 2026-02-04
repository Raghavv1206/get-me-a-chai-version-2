# Troubleshooting Guide

## Common Build Cache Errors

If you encounter errors like:
- `Cannot find module '_document.js'`
- `Cannot read properties of undefined (reading '/_app')`
- `ENOENT: no such file or directory, open '.next\server\app\...'`
- `Invariant: Expected clientReferenceManifest to be defined`

These are **build cache corruption issues** in Next.js 15.

## Quick Fix

### Option 1: Use the Clean Restart Script (Recommended)
```powershell
.\scripts\clean-restart.ps1
```

### Option 2: Manual Steps
```powershell
# 1. Stop all Node.js processes
taskkill /F /IM node.exe

# 2. Delete the .next folder
Remove-Item -Path ".next" -Recurse -Force

# 3. Restart the dev server
npm run dev
```

## Why This Happens

Next.js 15's Fast Refresh can sometimes get into a bad state when:
- Hot Module Replacement (HMR) encounters certain errors
- Large file changes occur
- Multiple dev servers are running simultaneously
- The build cache becomes corrupted during development

## Prevention Tips

1. **Run only one dev server at a time**
   - Check for multiple `npm run dev` processes
   - Use `taskkill /F /IM node.exe` to clean up

2. **Restart after major changes**
   - After installing new dependencies
   - After modifying `next.config.mjs`
   - After changing environment variables

3. **Use the clean restart script**
   - Whenever you see persistent errors
   - After pulling major changes from git

## Other Common Issues

### Missing Images (404 errors)
If you see 404 errors for campaign images, they should be located in:
```
public/images/campaigns/
├── tech-1.jpg
├── game-1.jpg
├── food-1.jpg
├── art-1.jpg
└── music-1.jpg
```

### MongoDB Connection Issues
Make sure your `.env.local` file has the correct MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/get-me-a-chai
```

### Port Already in Use
If port 3000 is in use, Next.js will automatically use the next available port (3001, 3002, etc.)

## Need More Help?

Check the official Next.js documentation:
- [Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh)
- [Troubleshooting](https://nextjs.org/docs/app/building-your-application/configuring/error-handling)
