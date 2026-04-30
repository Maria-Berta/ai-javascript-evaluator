// evaluator.js - Improved version with better detection

/**
 * Check #1: Async/await correctness - IMPROVED
 */
function checkAsyncAwait(code) {
  const issues = [];
  const lines = code.split('\n');
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // Pattern 1: .then() inside async function (bad mixing)
    if (line.includes('async') && line.includes('.then(')) {
      issues.push({
        type: 'async-await',
        severity: 'HIGH',
        line: lineNum,
        message: 'Mixed async/await with .then() - choose one pattern consistently'
      });
    }
    
    // Pattern 2: Promise-returning call without await inside async function
    const hasAsyncKeyword = line.includes('async function') || 
                            (line.includes('=>') && code.split('\n')[idx-1]?.includes('async'));
    
    if (hasAsyncKeyword || code.includes('async')) {
      // Look for fetch, axios, database calls without await
      const promiseCalls = ['fetch(', 'axios(', 'db.', 'query(', 'get(', 'post(', 'put(', 'delete('];
      promiseCalls.forEach(call => {
        if (line.includes(call) && !line.includes(`await ${call}`) && !line.includes('await ' + call)) {
          // Make sure it's not a variable declaration or comment
          if (!line.trim().startsWith('//') && !line.includes('const ') && !line.includes('let ')) {
            issues.push({
              type: 'async-await',
              severity: 'MEDIUM',
              line: lineNum,
              message: `Potentially missing 'await' before ${call} in async context`
            });
          }
        }
      });
    }
    
    // Pattern 3: Promise created without using await or .then
    if (line.includes('new Promise') && !line.includes('await') && !line.includes('.then(')) {
      issues.push({
        type: 'async-await',
        severity: 'MEDIUM',
        line: lineNum,
        message: 'Promise created but not awaited or chained'
      });
    }
  });
  
  return issues;
}

/**
 * Check #2: Error handling - IMPROVED
 */
function checkErrorHandling(code) {
  const issues = [];
  const lines = code.split('\n');
  
  // Check each line for patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // PATTERN 1: Empty catch block on a SINGLE line
    // Example: catch(e) {}
    if (line.match(/catch\s*\([^)]*\)\s*{\s*}/)) {
      issues.push({
        type: 'error-handling',
        severity: 'CRITICAL',
        line: lineNum,
        message: 'Empty catch block - errors will be silently ignored'
      });
    }
    
    // PATTERN 2: Empty catch block spanning MULTIPLE lines
    // Example: catch(e) { 
    //           // just a comment or nothing
    //          }
    if (line.includes('catch') && line.includes('{')) {
      // Look ahead to find the closing brace
      let braceCount = 1;
      let isEmpty = true;
      let j = i + 1;
      
      while (j < lines.length && braceCount > 0) {
        const nextLine = lines[j];
        
        // Check if line has actual code (not just whitespace or comments)
        const hasCode = nextLine.trim().length > 0 && 
                       !nextLine.trim().startsWith('//') &&
                       !nextLine.trim().startsWith('*');
        
        if (hasCode && braceCount === 1) {
          isEmpty = false;
        }
        
        // Count braces
        for (const char of nextLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        j++;
      }
      
      if (isEmpty) {
        issues.push({
          type: 'error-handling',
          severity: 'CRITICAL',
          line: lineNum,
          message: 'Empty catch block spanning multiple lines - silent failure'
        });
      }
    }
    
    // PATTERN 3: Async function with await but no error handling ANYWHERE in function
    if (line.includes('async function') || (line.includes('async') && line.includes('=>'))) {
      // Find the function body
      let functionBody = '';
      let braceCount = 0;
      let inFunction = false;
      let hasTryCatch = false;
      let hasDotCatch = false;
      
      for (let j = i; j < Math.min(i + 30, lines.length); j++) {
        const blockLine = lines[j];
        if (blockLine.includes('{')) {
          inFunction = true;
          braceCount += (blockLine.match(/{/g) || []).length;
        }
        if (inFunction) {
          functionBody += blockLine;
          if (blockLine.includes('try') && blockLine.includes('catch')) hasTryCatch = true;
          if (blockLine.includes('.catch(')) hasDotCatch = true;
        }
        if (blockLine.includes('}')) {
          braceCount -= (blockLine.match(/}/g) || []).length;
          if (braceCount === 0) break;
        }
      }
      
      // If function has await but no error handling
      if (functionBody.includes('await') && !hasTryCatch && !hasDotCatch) {
        issues.push({
          type: 'error-handling',
          severity: 'HIGH',
          line: lineNum,
          message: 'Async function with await lacks try/catch or .catch()'
        });
      }
    }
    
    // PATTERN 4: Promise without .catch()
    if (line.includes('new Promise') && !line.includes('.catch(')) {
      // Check if .catch appears within next 5 lines
      let hasCatch = false;
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('.catch(')) {
          hasCatch = true;
          break;
        }
      }
      if (!hasCatch) {
        issues.push({
          type: 'error-handling',
          severity: 'HIGH',
          line: lineNum,
          message: 'Promise created without .catch() - unhandled rejection risk'
        });
      }
    }
  }
  
  return issues;
}
/**
 * Check #3: Memory/closure pitfalls - IMPROVED
 */
function checkClosurePitfalls(code) {
  const issues = [];
  const lines = code.split('\n');
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // setInterval without clearInterval reference
    if (line.includes('setInterval(') && !code.includes('clearInterval')) {
      issues.push({
        type: 'closure-memory',
        severity: 'HIGH',
        line: lineNum,
        message: 'setInterval without clearInterval - memory leak risk'
      });
    }
    
    // setTimeout in loops (common memory issue)
    if (line.includes('for') && lines[idx + 1]?.includes('setTimeout')) {
      issues.push({
        type: 'closure-memory',
        severity: 'MEDIUM',
        line: lineNum,
        message: 'setTimeout inside loop can cause unexpected closure behavior'
      });
    }
    
    // Event listeners
    if (line.includes('addEventListener') && !code.includes('removeEventListener')) {
      issues.push({
        type: 'closure-memory',
        severity: 'MEDIUM',
        line: lineNum,
        message: 'addEventListener without removeEventListener - potential memory leak'
      });
    }
    
    // Large array in closure
    if (line.includes('new Array(') && line.match(/Array\((\d{5,})\)/)) {
      issues.push({
        type: 'closure-memory',
        severity: 'MEDIUM',
        line: lineNum,
        message: 'Large array created - ensure it doesn\'t persist in closure'
      });
    }
  });
  
  return issues;
}

/**
 * Main evaluation function
 */
async function evaluateCode(code) {
  console.log('\n🔍 EVALUATING AI-GENERATED JAVASCRIPT CODE\n');
  console.log('='.repeat(60));
  
  const asyncIssues = checkAsyncAwait(code);
  const errorIssues = checkErrorHandling(code);
  const memoryIssues = checkClosurePitfalls(code);
  
  // Calculate score (each issue deducts points based on severity)
    // Calculate score (STRICTER - for AI trainer role)
  let score = 100;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  
  [...asyncIssues, ...errorIssues, ...memoryIssues].forEach(issue => {
    if (issue.severity === 'CRITICAL') {
      score -= 30;  // Was 20
      criticalCount++;
    } else if (issue.severity === 'HIGH') {
      score -= 20;  // Was 10
      highCount++;
    } else if (issue.severity === 'MEDIUM') {
      score -= 10;  // Was 5
      mediumCount++;
    }
  });
  
  // Harsher penalty for multiple issues
  const totalIssues = criticalCount + highCount + mediumCount;
  if (totalIssues >= 3) {
    score -= 15; // Penalty for messy code
  } else if (totalIssues >= 2) {
    score -= 5;
  }
  
  // Any CRITICAL issue auto-fails
  if (criticalCount > 0) {
    score = Math.min(score, 65);
  }


  // Print results
  console.log(`📊 OVERALL SCORE: ${score}/100\n`);
  console.log(`   (${criticalCount} critical, ${highCount} high, ${mediumCount} medium issues)\n`);
  
  console.log('📋 DETAILED FINDINGS:\n');
  
  console.log('1️⃣ Async/Await Issues:');
  if (asyncIssues.length === 0) {
    console.log('   ✅ No async/await problems detected');
  } else {
    asyncIssues.forEach(issue => {
      console.log(`   ❌ [${issue.severity}] Line ${issue.line}: ${issue.message}`);
    });
  }
  
  console.log('\n2️⃣ Error Handling Issues:');
  if (errorIssues.length === 0) {
    console.log('   ✅ Error handling appears correct');
  } else {
    errorIssues.forEach(issue => {
      console.log(`   ❌ [${issue.severity}] Line ${issue.line}: ${issue.message}`);
    });
  }
  
  console.log('\n3️⃣ Memory & Closure Pitfalls:');
  if (memoryIssues.length === 0) {
    console.log('   ✅ No memory leak patterns detected');
  } else {
    memoryIssues.forEach(issue => {
      console.log(`   ❌ [${issue.severity}] Line ${issue.line}: ${issue.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 VERDICT: ${score >= 70 ? 'PASS - Acceptable AI response' : 'FAIL - Needs improvement'}\n`);
  
  return { score, asyncIssues, errorIssues, memoryIssues };
}

module.exports = { evaluateCode };