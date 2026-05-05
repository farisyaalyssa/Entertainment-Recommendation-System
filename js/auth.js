// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.checkSession();
        this.setupFormListeners();
    }
    
    // Check if user is logged in
    checkSession() {
        const session = localStorage.getItem('watchly_session');
        if (session) {
            try {
                const { user, expires } = JSON.parse(session);
                if (Date.now() < expires) {
                    this.currentUser = user;
                    this.updateUI();
                } else {
                    localStorage.removeItem('watchly_session');
                }
            } catch (e) {
                console.error('Session error:', e);
            }
        }
    }
    
    // Setup form listeners
    setupFormListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Register form
        const registerForm = document.getElementById('preferencesForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }
    
    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('rememberMe')?.checked || false;
        
        try {
            // Mock login - replace with actual API call
            await this.mockDelay(1000);
            
            const user = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0],
                avatar: email.charAt(0).toUpperCase()
            };
            
            this.currentUser = user;
            
            // Save session
            const expires = Date.now() + (remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
            localStorage.setItem('watchly_session', JSON.stringify({ user, expires }));
            
            // Check if first time user
            const isFirstTime = !localStorage.getItem('watchly_preferences');
            window.location.href = isFirstTime ? 'onboarding.html' : 'home.html';
            
        } catch (error) {
            this.showError('loginError', 'Invalid credentials. Please try again.');
        }
    }
    
    // Handle registration
    async handleRegister(e) {
        e.preventDefault();
        
        const genres = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
            .map(cb => cb.value);
        const contentRating = document.getElementById('contentRating').value;
        
        // Save preferences
        localStorage.setItem('watchly_preferences', JSON.stringify({
            genres,
            contentRating
        }));
        
        // Mock registration
        await this.mockDelay(1500);
        
        window.location.href = 'onboarding.html';
    }
    
    // Update UI based on auth state
    updateUI() {
        const avatar = document.getElementById('userAvatar');
        if (avatar && this.currentUser) {
            avatar.textContent = this.currentUser.avatar || 'A';
        }
    }
    
    // Show error message
    showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            setTimeout(() => errorEl.classList.remove('show'), 5000);
        }
    }
    
    // Mock API delay
    mockDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Logout
    logout() {
        localStorage.removeItem('watchly_session');
        window.location.href = 'index.html';
    }
}

// Initialize auth manager
const auth = new AuthManager();

// Global functions
function logout() {
    auth.logout();
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
});