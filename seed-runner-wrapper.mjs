// seed-runner-wrapper.mjs
// Runs seed.js and writes results to a clean text file
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
    const output = execSync('node scripts/seed.js', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 120000,
        stdio: 'pipe',
    });
    writeFileSync('seed-result.txt', output, 'utf8');
    console.log('SUCCESS');
} catch (err) {
    const combined = (err.stdout || '') + '\n--- STDERR ---\n' + (err.stderr || '');
    writeFileSync('seed-result.txt', combined, 'utf8');
    console.log('ERROR logged to seed-result.txt');
}
