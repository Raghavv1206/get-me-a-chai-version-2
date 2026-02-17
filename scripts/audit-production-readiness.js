#!/usr/bin/env node

/**
 * Production Optimization Audit Script
 * Scans all server actions and API routes for optimization opportunities
 * 
 * Run with: node scripts/audit-production-readiness.js
 */

const fs = require('fs');
const path = require('path');

// Patterns to check
const ANTI_PATTERNS = {
    consoleLog: /console\.(log|debug|info|warn|error)/g,
    noValidation: /export\s+async\s+function\s+\w+\([^)]*\)\s*{(?![\s\S]*validate)/,
    noRateLimit: /export\s+async\s+function\s+\w+\([^)]*\)\s*{(?![\s\S]*checkRateLimit)/,
    noLogging: /export\s+async\s+function\s+\w+\([^)]*\)\s*{(?![\s\S]*logger\.)/,
    noTryCatch: /export\s+async\s+function\s+\w+\([^)]*\)\s*{(?![\s\S]*try\s*{)/,
    noAuth: /export\s+async\s+function\s+\w+\([^)]*\)\s*{(?![\s\S]*getServerSession)/
};

// Directories to scan
const SCAN_DIRS = [
    'actions',
    'app/api'
];

// Results
const results = {
    totalFiles: 0,
    totalFunctions: 0,
    issues: {
        consoleLog: [],
        noValidation: [],
        noRateLimit: [],
        noLogging: [],
        noTryCatch: [],
        noAuth: []
    }
};

/**
 * Scan a file for anti-patterns
 */
function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(process.cwd(), filePath);

    results.totalFiles++;

    // Count functions
    const functionMatches = content.match(/export\s+async\s+function\s+\w+/g) || [];
    results.totalFunctions += functionMatches.length;

    // Check for console.log
    const consoleMatches = content.match(ANTI_PATTERNS.consoleLog);
    if (consoleMatches) {
        results.issues.consoleLog.push({
            file: fileName,
            count: consoleMatches.length,
            lines: getLineNumbers(content, ANTI_PATTERNS.consoleLog)
        });
    }

    // Check for missing validation
    if (!content.includes('validate') && functionMatches.length > 0) {
        results.issues.noValidation.push({
            file: fileName,
            functions: functionMatches.length
        });
    }

    // Check for missing rate limiting
    if (!content.includes('checkRateLimit') && !content.includes('withRateLimit')) {
        results.issues.noRateLimit.push({
            file: fileName,
            functions: functionMatches.length
        });
    }

    // Check for missing logging
    if (!content.includes('logger.') && !content.includes('createLogger')) {
        results.issues.noLogging.push({
            file: fileName,
            functions: functionMatches.length
        });
    }

    // Check for missing try-catch
    const tryCatchCount = (content.match(/try\s*{/g) || []).length;
    if (tryCatchCount < functionMatches.length) {
        results.issues.noTryCatch.push({
            file: fileName,
            functions: functionMatches.length,
            tryCatchBlocks: tryCatchCount
        });
    }
}

/**
 * Get line numbers for matches
 */
function getLineNumbers(content, pattern) {
    const lines = content.split('\n');
    const lineNumbers = [];

    lines.forEach((line, index) => {
        if (pattern.test(line)) {
            lineNumbers.push(index + 1);
        }
    });

    return lineNumbers;
}

/**
 * Scan directory recursively
 */
function scanDirectory(dir) {
    const fullPath = path.join(process.cwd(), dir);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(fullPath, { withFileTypes: true });

    files.forEach(file => {
        const filePath = path.join(fullPath, file.name);

        if (file.isDirectory() && !file.name.startsWith('.')) {
            scanDirectory(path.join(dir, file.name));
        } else if (file.name.endsWith('.js') && !file.name.includes('.test.')) {
            scanFile(filePath);
        }
    });
}

/**
 * Generate report
 */
function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 PRODUCTION READINESS AUDIT REPORT');
    console.log('='.repeat(80) + '\n');

    console.log(`📊 Summary:`);
    console.log(`   Files scanned: ${results.totalFiles}`);
    console.log(`   Functions found: ${results.totalFunctions}`);
    console.log('');

    // Console.log issues
    if (results.issues.consoleLog.length > 0) {
        console.log(`❌ Console.log statements found in ${results.issues.consoleLog.length} files:`);
        results.issues.consoleLog.forEach(issue => {
            console.log(`   ${issue.file}: ${issue.count} occurrences (lines: ${issue.lines.join(', ')})`);
        });
        console.log('');
    } else {
        console.log(`✅ No console.log statements found\n`);
    }

    // Validation issues
    if (results.issues.noValidation.length > 0) {
        console.log(`⚠️  Missing input validation in ${results.issues.noValidation.length} files:`);
        results.issues.noValidation.forEach(issue => {
            console.log(`   ${issue.file}: ${issue.functions} functions`);
        });
        console.log('');
    } else {
        console.log(`✅ All files have input validation\n`);
    }

    // Rate limiting issues
    if (results.issues.noRateLimit.length > 0) {
        console.log(`⚠️  Missing rate limiting in ${results.issues.noRateLimit.length} files:`);
        results.issues.noRateLimit.forEach(issue => {
            console.log(`   ${issue.file}: ${issue.functions} functions`);
        });
        console.log('');
    } else {
        console.log(`✅ All files have rate limiting\n`);
    }

    // Logging issues
    if (results.issues.noLogging.length > 0) {
        console.log(`⚠️  Missing logging in ${results.issues.noLogging.length} files:`);
        results.issues.noLogging.forEach(issue => {
            console.log(`   ${issue.file}: ${issue.functions} functions`);
        });
        console.log('');
    } else {
        console.log(`✅ All files have logging\n`);
    }

    // Try-catch issues
    if (results.issues.noTryCatch.length > 0) {
        console.log(`⚠️  Insufficient error handling in ${results.issues.noTryCatch.length} files:`);
        results.issues.noTryCatch.forEach(issue => {
            console.log(`   ${issue.file}: ${issue.functions} functions, ${issue.tryCatchBlocks} try-catch blocks`);
        });
        console.log('');
    } else {
        console.log(`✅ All functions have error handling\n`);
    }

    // Calculate score
    const totalIssues = Object.values(results.issues).reduce((sum, arr) => sum + arr.length, 0);
    const maxIssues = results.totalFiles * 5; // 5 checks per file
    const score = Math.max(0, Math.round((1 - totalIssues / maxIssues) * 100));

    console.log('='.repeat(80));
    console.log(`📈 Production Readiness Score: ${score}%`);
    console.log('='.repeat(80) + '\n');

    if (score >= 90) {
        console.log('🎉 Excellent! Your code is production-ready!');
    } else if (score >= 70) {
        console.log('👍 Good progress! A few more improvements needed.');
    } else if (score >= 50) {
        console.log('⚠️  Needs work. Focus on critical issues first.');
    } else {
        console.log('❌ Significant improvements required before production.');
    }

    console.log('');
}

/**
 * Main execution
 */
console.log('🚀 Starting production readiness audit...\n');

SCAN_DIRS.forEach(dir => {
    console.log(`Scanning: ${dir}/`);
    scanDirectory(dir);
});

generateReport();

// Save detailed report to file
const reportPath = path.join(process.cwd(), 'AUDIT_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`📄 Detailed report saved to: AUDIT_REPORT.json\n`);
