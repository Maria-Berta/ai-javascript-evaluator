// This AI-generated code will FAIL the async/await check

async function fetchUserData(userId) {
  // PROBLEM 1: Missing await on fetch
  const response = fetch(`https://api.example.com/users/${userId}`);
  
  // PROBLEM 2: Mixed async/await with .then()
  return response.then(res => res.json()).then(data => {
    console.log(data);
    return data;
  });
}

// PROBLEM 3: Async function called without await
fetchUserData(123);