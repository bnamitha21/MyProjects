// NutriScore AI Main JavaScript Helpers

console.log("NutriScore AI loaded.");

// Helper function to safely attach event listeners
function attachEventIfExist(id, eventType, callback) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(eventType, callback);
    }
}

// Redirect if already logged in (for login/signup pages)
function checkAuthRedirect() {
    const path = window.location.pathname;
    const isAuthPage = path.includes('/login') || path.includes('/signup') || path === '/';
    
    // If logged in and on an auth page, redirect to dashboard
    if (localStorage.getItem('userId') && isAuthPage) {
        window.location.href = '/dashboard';
    }
}

// Ensure execution on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    checkAuthRedirect();
});
