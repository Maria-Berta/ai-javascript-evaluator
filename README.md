# 🤖 AI JavaScript Code Evaluator

**Built for the JavaScript Coding Specialist - AI Trainer role**

This tool evaluates AI-generated JavaScript code for three critical failure modes that large language models commonly produce.

## The Three Checks

| Check              |              What It Detects                                 | Severity      |
|--------------------|--------------------------------------------------------------|---------------|
| **Async/Await**    | Mixed `.then()` patterns, missing await                      | HIGH          |
| **Error Handling** | Async operations without try/catch, empty catch blocks       | HIGH → CRITICAL 
| **Memory Leaks**   | setInterval without cleanup, event listeners without removal | MEDIUM → HIGH |

## Scoring Philosophy

This evaluator uses **strict** scoring because AI models need to learn production-ready code:

- **HIGH issue** = -20 points
- **MEDIUM issue** = -10 points  
- **CRITICAL issue** = auto-fail
- **Passing score** = 85+ (tougher than typical linters)

## Demo: 3 AI-Generated Failures

### 1. Bad Async/Await (Score: 55/100 - FAIL)
```javascript
async function fetchUserData(userId) {
  const response = fetch(`/api/users/${userId}`); // ❌ missing await
  return response.then(res => res.json()); // ❌ mixing patterns
}

### 2. No Error Handling (Score: 35/100 - FAIL)
```javascript
async function deleteDatabaseRecord(id) {
  // ❌ No try/catch around await - this will crash if db fails
  const result = await database.query(`DELETE FROM users WHERE id = ${id}`);
  
  // ❌ Promise created without .catch() - unhandled rejection
  new Promise((resolve, reject) => {
    if (!id) reject(new Error('No ID provided'));
    resolve(id);
  });
  
  return result;
}

function updateUser(data) {
  try {
    JSON.parse(data);
  } catch(e) {
    // ❌ Empty catch block - silent failure
  }
}

// ❌ Async function called without error handling
deleteDatabaseRecord(123);

###3. Memory Leak (Score: 45/100 - FAIL)
```javascript
function setupAutoSave() {
  // ❌ setInterval without cleanup reference
  setInterval(() => {
    console.log('Auto-saving...');
  }, 5000);
  
  // ❌ Large array retained in closure
  const hugeCache = new Array(1000000);
  return function() {
    console.log('Cache size:', hugeCache.length);
  };
}

function attachHandlers() {
  // ❌ Event listener without removal
  window.addEventListener('resize', () => {
    console.log('Window resized');
  });
}

setupAutoSave();
attachHandlers();
