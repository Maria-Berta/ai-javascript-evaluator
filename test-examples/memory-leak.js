// This AI-generated code will FAIL the memory/closure check

function setupAutoSave() {
  // PROBLEM 1: setInterval without cleanup reference
  setInterval(() => {
    console.log('Auto-saving...');
  }, 5000);
  
  // PROBLEM 2: Large array retained in closure
  const hugeCache = new Array(1000000);
  return function() {
    console.log('Cache size:', hugeCache.length);
  };
}

function attachHandlers() {
  // PROBLEM 3: Event listener without removal
  window.addEventListener('resize', () => {
    console.log('Window resized');
  });
}

setupAutoSave();
attachHandlers();
const leak = setupAutoSave(); // Another leak