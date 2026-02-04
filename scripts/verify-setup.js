// scripts/verify-setup.js
// Run this script to verify Phase 1 setup: node scripts/verify-setup.js

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Phase 1 Setup...\n');

let errors = 0;
let warnings = 0;

// Required files
const requiredFiles = [
  // Home components
  'components/home/HeroSection.js',
  'components/home/HowItWorksSection.js',
  'components/home/TrendingCampaigns.js',
  'components/home/CategoriesSection.js',
  'components/home/SuccessStories.js',
  'components/home/PlatformFeatures.js',
  'components/home/CTASection.js',
  
  // Updated components
  'components/Navbar.js',
  'components/Footer.js',
  
  // App files
  'app/page.js',
  'app/layout.js',
  
  // Models
  'models/User.js',
  'models/Campaign.js',
  'models/Payment.js',
  'models/Subscription.js',
  'models/Notification.js',
  'models/CampaignUpdate.js',
  'models/Comment.js',
  'models/Analytics.js',
  
  // Scripts
  'scripts/seed.js',
  
  // Config
  '.env.local'
];

// Check if files exist
console.log('📁 Checking required files...\n');

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    
    // Check for "use client" in component files
    if (file.includes('components/home/') || file.includes('Navbar.js') || file.includes('Footer.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('"use client"')) {
        console.log(`   ⚠️  Missing "use client" directive`);
        warnings++;
      }
    }
  } else {
    console.log(`❌ ${file} - MISSING`);
    errors++;
  }
});

// Check .env.local variables
console.log('\n🔑 Checking environment variables...\n');

if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const requiredVars = [
    'MONGO_URI',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GITHUB_ID',
    'GITHUB_SECRET',
    'NEXT_PUBLIC_URL'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - MISSING`);
      errors++;
    }
  });
  
  // Optional but recommended
  const optionalVars = ['OPENROUTER_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_SECRET'];
  console.log('\n📝 Optional variables:');
  optionalVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`⚠️  ${varName} - Not set (needed for AI features/payments)`);
      warnings++;
    }
  });
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...\n');

if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.seed) {
    console.log('✅ Seed script configured');
  } else {
    console.log('⚠️  Seed script not found in package.json');
    warnings++;
  }
  
  // Check for required dependencies
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    'mongoose',
    'next-auth',
    'framer-motion',
    'recharts'
  ];
  
  console.log('\n📚 Checking dependencies...\n');
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  requiredDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`⚠️  ${dep} - Not installed`);
      warnings++;
    }
  });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('\n✅ Perfect! Everything is set up correctly.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: npm run seed');
  console.log('   2. Run: npm run dev');
  console.log('   3. Open: http://localhost:3000');
} else {
  if (errors > 0) {
    console.log(`\n❌ ${errors} critical error(s) found`);
    console.log('   Please fix these before proceeding.');
  }
  if (warnings > 0) {
    console.log(`\n⚠️  ${warnings} warning(s) found`);
    console.log('   These are optional but recommended to fix.');
  }
  
  console.log('\n📖 Check the file placement guide for help.');
}

console.log('\n');

// Exit with error code if there are critical errors
process.exit(errors > 0 ? 1 : 0);