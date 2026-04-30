// This AI-generated code will FAIL the error handling check

async function deleteDatabaseRecord(id) {
  // PROBLEM 1: No try/catch in async function
  const result = await database.query(`DELETE FROM users WHERE id = ${id}`);
  
  // PROBLEM 2: Promise created without .catch()
  new Promise((resolve, reject) => {
    if (!id) reject(new Error('No ID provided'));
    resolve(id);
  });
  
  return result;
}

function updateUser(data) {
  try {
    // PROBLEM 3: Empty catch block
    JSON.parse(data);
  } catch(e) {
    // Silent failure - empty catch
  }
}