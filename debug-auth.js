// Debug script to test authentication flow
// Run this in the browser console to check authentication state

console.log("=== Authentication Debug Script ===");

// Check localStorage
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

console.log("LocalStorage Token:", token ? "Present" : "Missing");
console.log("LocalStorage User:", user ? "Present" : "Missing");

if (user) {
  try {
    const parsedUser = JSON.parse(user);
    console.log("Parsed User:", parsedUser);
  } catch (error) {
    console.error("Error parsing user:", error);
  }
}

// Check if we're on a dashboard page
const currentPath = window.location.pathname;
console.log("Current Path:", currentPath);

// Check for any console errors
console.log("=== End Debug Script ===");

// Instructions for testing:
console.log(`
=== Testing Instructions ===
1. Clear localStorage: localStorage.clear()
2. Go to /login
3. Log in with valid credentials
4. Check if redirected to dashboard
5. Check console for any errors
6. If stuck on loading, check network tab for failed requests
`);
