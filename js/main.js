// Utility Functions
const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Format date
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },
    
    // Truncate text
    truncate(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    },
    
    // Get initials from name
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ')
            .map(part => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
};

// Make Utils available globally
window.Utils = Utils;

// Navbar scroll handler for landing page
window.addEventListener('scroll', () => {
    const landingNavbar = document.querySelector('.landing-navbar');
    if (landingNavbar) {
        if (window.scrollY > 50) {
            landingNavbar.style.background = 'var(--background-darker)';
            landingNavbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        } else {
            landingNavbar.style.background = 'transparent';
            landingNavbar.style.boxShadow = 'none';
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Check if user is authenticated on protected pages
function requireAuth() {
    const session = localStorage.getItem('watchly_session');
    if (!session && !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html') &&
        !window.location.pathname.includes('index.html')) {
        window.location.href = 'pages/login.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
});