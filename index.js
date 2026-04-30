#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { evaluateCode } = require('./evaluator');

async function main() {
  // Get file path from command line
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log(`
🤖 AI JavaScript Code Evaluator
Usage: node index.js <file.js>

Examples:
  node index.js test-examples/bad-async.js
  node index.js test-examples/no-error-handling.js
  node index.js test-examples/memory-leak.js
`);
    process.exit(1);
  }
  
  const fullPath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  const code = fs.readFileSync(fullPath, 'utf-8');
  
  console.log(`\n📁 Evaluating: ${filePath}`);
  await evaluateCode(code);
}

main().catch(console.error);