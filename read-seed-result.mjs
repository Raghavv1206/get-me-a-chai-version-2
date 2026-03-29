import { readFileSync } from 'fs';
const content = readFileSync('seed-result.txt', 'utf8');
console.log('=== SEED OUTPUT ===');
console.log(content.slice(-3000)); // last 3000 chars
