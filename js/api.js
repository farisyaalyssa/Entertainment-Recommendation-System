var API_BASE = 'http://localhost:5000';

function getAuthToken() {
    var token = localStorage.getItem('watchly_token');
    if (token) return token;

    try {
        var session = JSON.parse(localStorage.getItem('watchly_session') || '{}');
        return session.token || null;
    } catch (e) {
        return null;
    }
}

function getCurrentUserId() {
    try {
        var session = JSON.parse(localStorage.getItem('watchly_session') || '{}');
        return session.user ? (session.user.id || session.user._id) : null;
    } catch (e) {
        return null;
    }
}

function saveSession(user, token, remember) {
    var days = remember ? 30 : 7;
    var expires = Date.now() + days * 24 * 60 * 60 * 1000;

    localStorage.setItem('watchly_token', token);
    localStorage.setItem('watchly_session', JSON.stringify({ user: user, token: token, expires: expires }));
}

function clearSession() {
    localStorage.removeItem('watchly_token');
    localStorage.removeItem('watchly_session');
}

function logout() {
    clearSession();
    window.location.href = '../index.html';
}

function toggleUserDropdown(e) {
    if (e) e.preventDefault();
    var dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

function setupUserMenu() {
    var avatar = document.getElementById('userAvatar');
    if (!avatar || avatar.closest('.user-menu')) return;

    var menu = document.createElement('div');
    menu.className = 'user-menu';

    avatar.parentNode.insertBefore(menu, avatar);
    menu.appendChild(avatar);

    avatar.addEventListener('click', function(e) {
        e.preventDefault();
        toggleUserDropdown();
    });

    var dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.id = 'userDropdown';
    dropdown.innerHTML =
        '<a href="profile.html">My Profile</a>' +
        '<a href="#" class="logout-link">Log Out</a>';
    menu.appendChild(dropdown);

    dropdown.querySelector('.logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

function initNav() {
    updateNavAvatar();
    setupUserMenu();
}

function updateNavAvatar() {
    var avatarEl = document.getElementById('userAvatar') || document.querySelector('.nav-avatar');
    if (!avatarEl) return;

    try {
        var session = JSON.parse(localStorage.getItem('watchly_session') || '{}');
        if (!session.user) return;

        if (session.user.avatar) {
            avatarEl.innerHTML = '<img src="' + session.user.avatar + '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        } else if (session.user.name) {
            avatarEl.textContent = session.user.name.charAt(0).toUpperCase();
        }
    } catch (e) {
        console.error('Avatar update error:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
} else {
    initNav();
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-menu')) {
        var dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});

function requireAuth(redirectUrl) {
    if (!getAuthToken()) {
        alert('Please log in to continue.');
        window.location.href = redirectUrl || 'login.html';
        return false;
    }
    return true;
}

function formatApiError(data) {
    if (data.errors && data.errors.length) {
        return data.errors.map(function(err) { return err.message; }).join(' ');
    }
    return data.message || 'Something went wrong';
}

function handleResponse(res) {
    return res.json().then(function(data) {
        if (!res.ok) {
            throw new Error(formatApiError(data));
        }
        return data;
    }).catch(function(err) {
        if (err instanceof SyntaxError) {
            throw new Error('Cannot reach the server. Make sure the backend is running (cd backend && npm run dev).');
        }
        throw err;
    });
}

function apiPublic(path, options) {
    options = options || {};
    options.headers = Object.assign({
        'Content-Type': 'application/json'
    }, options.headers || {});

    return fetch(API_BASE + path, options)
        .then(handleResponse)
        .catch(function(err) {
            if (err.message === 'Failed to fetch') {
                throw new Error('Cannot reach the server. Make sure the backend is running (cd backend && npm run dev).');
            }
            throw err;
        });
}

function apiFetch(path, options, redirectUrl) {
    if (!getAuthToken()) {
        requireAuth(redirectUrl || 'login.html');
        return Promise.reject(new Error('Not authenticated'));
    }

    options = options || {};
    options.headers = Object.assign({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken()
    }, options.headers || {});

    return fetch(API_BASE + path, options)
        .then(handleResponse)
        .catch(function(err) {
            if (err.message === 'Failed to fetch') {
                throw new Error('Cannot reach the server. Make sure the backend is running (cd backend && npm run dev).');
            }
            throw err;
        });
}
