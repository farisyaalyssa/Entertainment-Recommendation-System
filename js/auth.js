class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkSession();
        this.setupFormListeners();
    }

    checkSession() {
        var session = localStorage.getItem('watchly_session');
        if (!session) return;

        try {
            var parsed = JSON.parse(session);
            if (Date.now() < parsed.expires) {
                this.currentUser = parsed.user;
                this.updateUI();
            } else {
                clearSession();
            }
        } catch (e) {
            console.error('Session error:', e);
            clearSession();
        }
    }

    setupFormListeners() {
        var loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        var registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    needsOnboarding(user) {
        return !user.preferences || !user.preferences.genres || user.preferences.genres.length < 3;
    }

    async handleLogin(e) {
        e.preventDefault();

        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value;
        var remember = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;
        var submitBtn = e.target.querySelector('button[type="submit"]');

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Signing in...';
            }

            var data = await apiPublic('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: email, password: password })
            });

            this.currentUser = data.user;
            saveSession(data.user, data.token, remember);

            window.location.href = this.needsOnboarding(data.user) ? 'onboarding.html' : 'home.html';
        } catch (error) {
            this.showError('loginError', error.message || 'Invalid credentials. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        var firstName = document.getElementById('firstName').value.trim();
        var lastName = document.getElementById('lastName').value.trim();
        var name = firstName + ' ' + lastName;
        var username = document.getElementById('username').value.trim().toLowerCase();
        var email = document.getElementById('regEmail').value.trim();
        var password = document.getElementById('regPassword').value;
        var submitBtn = e.target.querySelector('button[type="submit"]');

        if (!document.getElementById('agreeTerms').checked) {
            this.showError('registerError', 'Please agree to the terms to continue.');
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating account...';
            }

            var data = await apiPublic('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    username: username,
                    email: email,
                    password: password
                })
            });

            this.currentUser = data.user;
            saveSession(data.user, data.token, false);

            window.location.href = 'onboarding.html';
        } catch (error) {
            this.showError('registerError', error.message || 'Registration failed. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        }
    }

    updateUI() {
        var avatar = document.getElementById('userAvatar');
        if (avatar && this.currentUser) {
            if (this.currentUser.avatar) {
                avatar.innerHTML = '<img src="' + this.currentUser.avatar + '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
            } else {
                avatar.textContent = (this.currentUser.name || 'A').charAt(0).toUpperCase();
            }
        }
    }

    showError(elementId, message) {
        var errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            setTimeout(function() { errorEl.classList.remove('show'); }, 5000);
        }
    }
}

var auth = new AuthManager();
