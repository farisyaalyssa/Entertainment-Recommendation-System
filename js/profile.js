var API_BASE = 'http://localhost:5000';
var TMDB_KEY = '9702460f55f5b08f0ad2c93b27dcebf3';
var TMDB_BASE = 'https://api.themoviedb.org/3';

var selectedOption = null;
var pendingAvatar = null;
var currentUser = null;

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

function requireAuth() {
    if (!getAuthToken()) {
        alert('Please log in to view your profile.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function apiFetch(path, options) {
    if (!requireAuth()) {
        return Promise.reject(new Error('Not authenticated'));
    }

    options = options || {};
    options.headers = Object.assign({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAuthToken()
    }, options.headers || {});

    return fetch(API_BASE + path, options).then(function(res) {
        return res.json().then(function(data) {
            if (!res.ok) {
                throw new Error(data.message || 'Request failed');
            }
            return data;
        });
    });
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatRelativeDate(dateStr) {
    var date = new Date(dateStr);
    var diffMs = Date.now() - date.getTime();
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return diffDays + ' days ago';
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
    return date.toLocaleDateString();
}

function updateAvatarDisplay(name, avatar) {
    var initial = name ? name.charAt(0).toUpperCase() : '?';
    var avatarCircle = document.querySelector('.avatar-circle');
    var navAvatar = document.querySelector('.nav-avatar');
    var preview = document.getElementById('avatar-preview');

    if (avatar) {
        var imgHtml = '<img src="' + avatar + '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        avatarCircle.innerHTML = imgHtml;
        navAvatar.innerHTML = imgHtml;
        if (preview) preview.innerHTML = imgHtml;
    } else {
        avatarCircle.textContent = initial;
        navAvatar.textContent = initial;
        if (preview) preview.textContent = initial;
    }
}

function renderProfile(user) {
    currentUser = user;
    document.querySelector('.profile-name').textContent = user.name;
    document.querySelector('.profile-username').textContent = '@' + user.username;
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-username').value = user.username;
    updateAvatarDisplay(user.name, user.avatar);
}

function renderMovieGrid(containerId, items, emptyMessage) {
    var container = document.getElementById(containerId);
    if (!items.length) {
        container.innerHTML = '<p class="text-muted mt-3">' + emptyMessage + '</p>';
        return;
    }

    container.innerHTML = items.map(function(item) {
        var poster = item.poster || 'https://via.placeholder.com/200x300/1a2d47/F63049?text=No+Poster';
        return '<div class="col-lg-3 col-md-4 col-6 mb-4">' +
            '<div class="movie-card" onclick="window.location.href=\'content-detail.html?id=' + item.tmdbId + '&type=' + item.type + '\'">' +
            '<img src="' + poster + '" class="movie-poster-img" alt="' + escapeHtml(item.title) + '">' +
            '<p class="movie-title">' + escapeHtml(item.title) + '</p>' +
            '</div></div>';
    }).join('');
}

function renderHistoryList(items) {
    var container = document.getElementById('history-list');
    if (!items.length) {
        container.innerHTML = '<p class="text-muted mt-3">No watch history yet.</p>';
        return;
    }

    container.innerHTML = items.map(function(item) {
        var posterContent = item.poster
            ? '<img src="' + item.poster + '" alt="" style="width:48px;height:72px;object-fit:cover;border-radius:4px;">'
            : escapeHtml(item.title.charAt(0));

        return '<div class="history-card mb-3">' +
            '<div class="d-flex justify-content-between align-items-center">' +
            '<div class="d-flex align-items-center">' +
            '<div class="history-poster mr-3">' + posterContent + '</div>' +
            '<div><p class="history-title">' + escapeHtml(item.title) + '</p>' +
            '<p class="history-meta">' + escapeHtml(item.type) + '</p></div></div>' +
            '<p class="history-date">' + formatRelativeDate(item.watchedAt) + '</p>' +
            '</div></div>';
    }).join('');
}

function fetchTmdbTitle(tmdbId, type) {
    return fetch(TMDB_BASE + '/' + type + '/' + tmdbId + '?api_key=' + TMDB_KEY)
        .then(function(res) { return res.json(); })
        .then(function(data) { return data.title || data.name || ('Title #' + tmdbId); })
        .catch(function() { return 'Title #' + tmdbId; });
}

function renderReviewsList(reviews) {
    var container = document.getElementById('reviews-list');
    if (!reviews.length) {
        container.innerHTML = '<p class="text-muted mt-3">No reviews yet.</p>';
        return;
    }

    container.innerHTML = reviews.map(function(review) {
        return '<div class="review-card mb-3" data-tmdb-id="' + review.tmdbId + '" data-type="' + review.type + '">' +
            '<div class="d-flex justify-content-between align-items-center mb-1">' +
            '<p class="review-title">Loading...</p>' +
            '<span class="review-rating">' + review.rating + '/10</span></div>' +
            '<p class="review-text">' + escapeHtml(review.review) + '</p>' +
            '<a href="content-detail.html?id=' + review.tmdbId + '&type=' + review.type + '">View title</a>' +
            '</div>';
    }).join('');

    reviews.forEach(function(review, index) {
        fetchTmdbTitle(review.tmdbId, review.type).then(function(title) {
            var card = container.children[index];
            if (card) card.querySelector('.review-title').textContent = title;
        });
    });
}

function loadWatchlist() {
    return apiFetch('/api/watchlist').then(function(data) {
        renderMovieGrid('watchlist-grid', data.items || [], 'Your watchlist is empty.');
    });
}

function loadFavourites() {
    return apiFetch('/api/favourites').then(function(data) {
        renderMovieGrid('favourites-grid', data.items || [], 'No favourites yet.');
    });
}

function loadHistory() {
    return apiFetch('/api/history').then(function(data) {
        renderHistoryList(data.items || []);
    });
}

function loadMyReviews() {
    return apiFetch('/api/reviews/mine').then(function(data) {
        renderReviewsList(data.reviews || []);
    });
}

function loadProfilePage() {
    if (!requireAuth()) return;

    apiFetch('/api/users/profile').then(function(data) {
        renderProfile(data.user);
        return Promise.all([loadWatchlist(), loadFavourites(), loadHistory(), loadMyReviews()]);
    }).catch(function(err) {
        alert(err.message);
        if (err.message.indexOf('authorized') !== -1 || err.message.indexOf('token') !== -1) {
            window.location.href = 'login.html';
        }
    });
}

function switchTab(tabName, clickedLink) {
    document.querySelectorAll('.tab-content').forEach(function(tab) {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-link').forEach(function(link) {
        link.classList.remove('active-tab');
    });
    document.getElementById(tabName).style.display = 'block';
    clickedLink.classList.add('active-tab');
}

function openChangePasswordModal() {
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-modal').style.display = 'flex';
}

function closeChangePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
}

function savePassword() {
    var currentPassword = document.getElementById('current-password').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields.');
        return;
    }
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
    }

    apiFetch('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
    }).then(function() {
        alert('Password changed successfully.');
        closeChangePasswordModal();
    }).catch(function(err) {
        alert(err.message);
    });
}

function openDeleteModal() {
    selectedOption = null;
    resetToggles();
    document.getElementById('confirm-btn').disabled = true;
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

function resetToggles() {
    document.getElementById('toggle-deactivate').classList.remove('toggle-on', 'toggle-danger');
    document.getElementById('toggle-delete').classList.remove('toggle-on', 'toggle-danger');
}

function selectToggle(type) {
    if (selectedOption === type) {
        selectedOption = null;
        resetToggles();
        document.getElementById('confirm-btn').disabled = true;
        return;
    }
    selectedOption = type;
    resetToggles();
    if (type === 'deactivate') {
        document.getElementById('toggle-deactivate').classList.add('toggle-on');
    } else {
        document.getElementById('toggle-delete').classList.add('toggle-on', 'toggle-danger');
    }
    document.getElementById('confirm-btn').disabled = false;
}

function clearSession() {
    localStorage.removeItem('watchly_token');
    localStorage.removeItem('watchly_session');
}

function confirmAction() {
    if (!selectedOption) return;

    apiFetch('/api/users/account', {
        method: 'DELETE',
        body: JSON.stringify({ action: selectedOption })
    }).then(function(data) {
        alert(data.message);
        clearSession();
        window.location.href = '../index.html';
    }).catch(function(err) {
        alert(err.message);
    });

    closeDeleteModal();
}

function openEditProfileModal() {
    if (currentUser) {
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-username').value = currentUser.username;
        updateAvatarDisplay(currentUser.name, pendingAvatar || currentUser.avatar);
    }
    document.getElementById('edit-profile-modal').style.display = 'flex';
}

function closeEditProfileModal() {
    pendingAvatar = null;
    document.getElementById('edit-profile-modal').style.display = 'none';
}

function previewAvatar(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('Image must be under 2MB.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        pendingAvatar = e.target.result;
        document.getElementById('avatar-preview').innerHTML =
            '<img src="' + pendingAvatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    };
    reader.readAsDataURL(file);
}

function saveProfile() {
    var newName = document.getElementById('edit-name').value.trim();
    var newUsername = document.getElementById('edit-username').value.trim();
    var payload = {};

    if (newName) payload.name = newName;
    if (newUsername) payload.username = newUsername;
    if (pendingAvatar) payload.avatar = pendingAvatar;

    if (!payload.name && !payload.username && !payload.avatar) {
        alert('Change at least one field to save.');
        return;
    }

    apiFetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
    }).then(function(data) {
        renderProfile(data.user);
        pendingAvatar = null;
        closeEditProfileModal();
    }).catch(function(err) {
        alert(err.message);
    });
}

function populatePreferencesModal(prefs) {
    prefs = prefs || { genres: [], contentRating: 'All', notifications: {} };

    document.querySelectorAll('.genre-chip input').forEach(function(cb) {
        cb.checked = prefs.genres.indexOf(cb.value) !== -1;
    });

    document.querySelectorAll('input[name="content-rating"]').forEach(function(radio) {
        radio.checked = radio.value === prefs.contentRating;
    });

    var notifs = prefs.notifications || {};
    document.getElementById('notif-recommendations').classList.toggle('toggle-on', !!notifs.recommendations);
    document.getElementById('notif-watchlist').classList.toggle('toggle-on', !!notifs.watchlistReminders);
    document.getElementById('notif-releases').classList.toggle('toggle-on', !!notifs.newReleases);
}

function openPreferencesModal() {
    if (currentUser) {
        populatePreferencesModal(currentUser.preferences);
    }
    document.getElementById('preferences-modal').style.display = 'flex';
}

function closePreferencesModal() {
    document.getElementById('preferences-modal').style.display = 'none';
}

function toggleNotif(el) {
    el.classList.toggle('toggle-on');
}

function savePreferences() {
    var genres = [];
    document.querySelectorAll('.genre-chip input:checked').forEach(function(cb) {
        genres.push(cb.value);
    });

    var rating = document.querySelector('input[name="content-rating"]:checked');
    var ratingVal = rating ? rating.value : 'All';

    apiFetch('/api/users/preferences', {
        method: 'PUT',
        body: JSON.stringify({
            genres: genres,
            contentRating: ratingVal,
            notifications: {
                recommendations: document.getElementById('notif-recommendations').classList.contains('toggle-on'),
                watchlistReminders: document.getElementById('notif-watchlist').classList.contains('toggle-on'),
                newReleases: document.getElementById('notif-releases').classList.contains('toggle-on')
            }
        })
    }).then(function(data) {
        currentUser = data.user;
        alert('Preferences saved!');
        closePreferencesModal();
    }).catch(function(err) {
        alert(err.message);
    });
}

function clearHistory() {
    if (!confirm('Clear all watch history? This cannot be undone.')) return;

    apiFetch('/api/history', { method: 'DELETE' }).then(function() {
        loadHistory();
    }).catch(function(err) {
        alert(err.message);
    });
}

window.addEventListener('load', function() {
    loadProfilePage();

    document.getElementById('password-modal').addEventListener('click', function(e) {
        if (e.target === this) closeChangePasswordModal();
    });
    document.getElementById('delete-modal').addEventListener('click', function(e) {
        if (e.target === this) closeDeleteModal();
    });
    document.getElementById('edit-profile-modal').addEventListener('click', function(e) {
        if (e.target === this) closeEditProfileModal();
    });
    document.getElementById('preferences-modal').addEventListener('click', function(e) {
        if (e.target === this) closePreferencesModal();
    });
});
