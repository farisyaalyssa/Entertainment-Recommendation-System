var TMDB_KEY = '9702460f55f5b08f0ad2c93b27dcebf3';
var TMDB_BASE = 'https://api.themoviedb.org/3';

var selectedOption = null;
var pendingAvatar = null;
var pendingAvatarRemoved = false;
var currentUser = null;

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
    var navAvatar = document.getElementById('userAvatar') || document.querySelector('.nav-avatar');
    var preview = document.getElementById('avatar-preview');
    var imgHtml = avatar
        ? '<img src="' + avatar + '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
        : null;

    if (avatarCircle) {
        if (imgHtml) avatarCircle.innerHTML = imgHtml;
        else avatarCircle.textContent = initial;
    }
    if (navAvatar) {
        if (imgHtml) navAvatar.innerHTML = imgHtml;
        else navAvatar.textContent = initial;
    }
    if (preview) {
        if (imgHtml) preview.innerHTML = imgHtml;
        else preview.textContent = initial;
    }
}

function renderProfile(user) {
    currentUser = user;
    document.querySelector('.profile-name').textContent = user.name;
    document.querySelector('.profile-username').textContent = '@' + user.username;
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-username').value = user.username;
    updateAvatarDisplay(user.name, user.avatar);
    updateSessionUser(user);
}

function renderMovieGrid(containerId, items, emptyMessage, listType) {
    var container = document.getElementById(containerId);
    if (!items.length) {
        container.innerHTML = '<p class="text-muted mt-3">' + emptyMessage + '</p>';
        return;
    }

    container.innerHTML = items.map(function(item) {
        var poster = item.poster || 'https://via.placeholder.com/200x300/1a2d47/F63049?text=No+Poster';
        var removeBtn = '';
        if (listType === 'watchlist') {
            removeBtn = '<button type="button" class="list-remove-btn" title="Remove from watchlist" ' +
                'onclick="event.stopPropagation(); removeFromWatchlist(' + item.tmdbId + ', \'' + item.type + '\')">&times;</button>';
        } else if (listType === 'favourites') {
            removeBtn = '<button type="button" class="list-remove-btn" title="Remove from favourites" ' +
                'onclick="event.stopPropagation(); removeFromFavourites(' + item.tmdbId + ', \'' + item.type + '\')">&times;</button>';
        }

        return '<div class="col-lg-3 col-md-4 col-6 mb-4">' +
            '<div class="movie-card-wrap">' +
            removeBtn +
            '<div class="movie-card" onclick="window.location.href=\'content-detail.html?id=' + item.tmdbId + '&type=' + item.type + '\'">' +
            '<img src="' + poster + '" class="movie-poster-img" alt="' + escapeHtml(item.title) + '">' +
            '<p class="movie-title">' + escapeHtml(item.title) + '</p>' +
            '</div></div></div>';
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

        return '<div class="history-card mb-3 history-card-clickable" role="button" tabindex="0" ' +
            'onclick="window.location.href=\'content-detail.html?id=' + item.tmdbId + '&type=' + item.type + '\'">' +
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
            '<div class="review-actions">' +
            '<a href="content-detail.html?id=' + review.tmdbId + '&type=' + review.type + '">View title</a>' +
            '<button type="button" class="btn-text-danger" onclick="deleteReview(\'' + review.id + '\')">Delete</button>' +
            '</div></div>';
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
        renderMovieGrid('watchlist-grid', data.items || [], 'Your watchlist is empty.', 'watchlist');
    }).catch(function(err) {
        document.getElementById('watchlist-grid').innerHTML =
            '<p class="text-muted mt-3">Could not load watchlist. ' + escapeHtml(err.message) + '</p>';
    });
}

function loadFavourites() {
    return apiFetch('/api/favourites').then(function(data) {
        renderMovieGrid('favourites-grid', data.items || [], 'No favourites yet.', 'favourites');
    }).catch(function(err) {
        document.getElementById('favourites-grid').innerHTML =
            '<p class="text-muted mt-3">Could not load favourites. ' + escapeHtml(err.message) + '</p>';
    });
}

function loadHistory() {
    return apiFetch('/api/history').then(function(data) {
        renderHistoryList(data.items || []);
    }).catch(function(err) {
        document.getElementById('history-list').innerHTML =
            '<p class="text-muted mt-3">Could not load history. ' + escapeHtml(err.message) + '</p>';
    });
}

function loadMyReviews() {
    return apiFetch('/api/reviews/mine').then(function(data) {
        renderReviewsList(data.reviews || []);
    }).catch(function(err) {
        document.getElementById('reviews-list').innerHTML =
            '<p class="text-muted mt-3">Could not load reviews. ' + escapeHtml(err.message) + '</p>';
    });
}

function removeFromWatchlist(tmdbId, type) {
    if (!confirm('Remove this title from your watchlist?')) return;

    apiFetch('/api/watchlist/' + tmdbId + '?type=' + type, { method: 'DELETE' })
        .then(function() { loadWatchlist(); })
        .catch(function(err) { alert(err.message); });
}

function removeFromFavourites(tmdbId, type) {
    if (!confirm('Remove this title from your favourites?')) return;

    apiFetch('/api/favourites/' + tmdbId + '?type=' + type, { method: 'DELETE' })
        .then(function() { loadFavourites(); })
        .catch(function(err) { alert(err.message); });
}

function deleteReview(reviewId) {
    if (!confirm('Delete this review? This cannot be undone.')) return;

    apiFetch('/api/reviews/' + reviewId, { method: 'DELETE' })
        .then(function() { loadMyReviews(); })
        .catch(function(err) { alert(err.message); });
}

function loadProfilePage() {
    if (!requireAuth('login.html')) return;

    apiFetch('/api/users/profile').then(function(data) {
        renderProfile(data.user);
        return Promise.all([loadWatchlist(), loadFavourites(), loadHistory(), loadMyReviews()]);
    }).catch(function(err) {
        alert(err.message);
        if (err.message.indexOf('deactivated') !== -1) {
            clearSession();
            window.location.href = 'login.html';
            return;
        }
        if (err.message.indexOf('authorized') !== -1 || err.message.indexOf('token') !== -1) {
            window.location.href = 'login.html';
        }
    });
}

function switchTab(tabName, clickedLink, e) {
    if (e && e.preventDefault) e.preventDefault();

    document.querySelectorAll('.tab-content').forEach(function(tab) {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-link').forEach(function(link) {
        link.classList.remove('active-tab');
    });
    document.getElementById(tabName).style.display = 'block';
    clickedLink.classList.add('active-tab');
}

function showPasswordError(message) {
    var errorEl = document.getElementById('password-error');
    if (!errorEl) return;
    if (message) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    } else {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }
}

function openChangePasswordModal() {
    var form = document.getElementById('password-form');
    if (form) form.reset();
    showPasswordError('');
    var saveBtn = document.querySelector('#password-modal .btn-save');
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
    document.getElementById('password-modal').style.display = 'flex';
    setTimeout(function() {
        var currentField = document.getElementById('current-password');
        if (currentField) currentField.focus();
    }, 0);
}

function closeChangePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    showPasswordError('');
}

function validateNewPassword(password) {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    return null;
}

function savePassword(event) {
    if (event && event.preventDefault) event.preventDefault();

    var currentPassword = document.getElementById('current-password').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;
    var saveBtn = document.querySelector('#password-modal .btn-save');

    showPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
        showPasswordError('Please fill in all password fields.');
        return;
    }
    if (newPassword !== confirmPassword) {
        showPasswordError('New passwords do not match.');
        return;
    }
    if (currentPassword === newPassword) {
        showPasswordError('New password must be different from your current password.');
        return;
    }

    var passwordError = validateNewPassword(newPassword);
    if (passwordError) {
        showPasswordError(passwordError);
        return;
    }

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }

    apiFetch('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
    }).then(function() {
        closeChangePasswordModal();
        alert('Password changed successfully. Use your new password next time you log in.');
    }).catch(function(err) {
        showPasswordError(err.message || 'Failed to change password.');
    }).finally(function() {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
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

function clearSessionAndRedirect() {
    logout();
}

function confirmAction() {
    if (!selectedOption) return;

    if (selectedOption === 'delete' && !confirm('Permanently delete your account and all data? This cannot be undone.')) {
        return;
    }

    var confirmBtn = document.getElementById('confirm-btn');
    var action = selectedOption;

    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Processing...';
    }

    apiFetch('/api/users/account', {
        method: 'DELETE',
        body: JSON.stringify({ action: action })
    }).then(function(data) {
        closeDeleteModal();
        alert(data.message);
        clearSessionAndRedirect();
    }).catch(function(err) {
        alert(err.message);
    }).finally(function() {
        if (confirmBtn) {
            confirmBtn.disabled = !selectedOption;
            confirmBtn.textContent = 'Confirm';
        }
    });
}

function updateRemoveAvatarButton() {
    var btn = document.getElementById('remove-avatar-btn');
    if (!btn) return;

    var hasPhoto = !!(pendingAvatar || (!pendingAvatarRemoved && currentUser && currentUser.avatar));
    btn.classList.toggle('is-visible', hasPhoto);
}

function openEditProfileModal() {
    pendingAvatar = null;
    pendingAvatarRemoved = false;
    var fileInput = document.getElementById('avatar-input');
    if (fileInput) fileInput.value = '';

    if (currentUser) {
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-username').value = currentUser.username;
        updateAvatarDisplay(currentUser.name, currentUser.avatar);
    }
    updateRemoveAvatarButton();
    document.getElementById('edit-profile-modal').style.display = 'flex';
}

function closeEditProfileModal() {
    document.getElementById('edit-profile-modal').style.display = 'none';
    pendingAvatar = null;
    pendingAvatarRemoved = false;
    var fileInput = document.getElementById('avatar-input');
    if (fileInput) fileInput.value = '';
    if (currentUser) {
        updateAvatarDisplay(currentUser.name, currentUser.avatar);
    }
    updateRemoveAvatarButton();
    var saveBtn = document.querySelector('#edit-profile-modal .btn-save');
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}

function removeProfilePhoto() {
    pendingAvatar = null;
    pendingAvatarRemoved = true;

    var name = document.getElementById('edit-name').value.trim();
    if (!name && currentUser) name = currentUser.name;
    updateAvatarDisplay(name, '');

    var fileInput = document.getElementById('avatar-input');
    if (fileInput) fileInput.value = '';
    updateRemoveAvatarButton();
}

function previewAvatar(event) {
    var file = event.target.files[0];
    if (!file) return;

    pendingAvatarRemoved = false;

    if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var maxSize = 400;
            var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            var canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            pendingAvatar = canvas.toDataURL('image/jpeg', 0.85);
            document.getElementById('avatar-preview').innerHTML =
                '<img src="' + pendingAvatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
            updateRemoveAvatarButton();
        };
        img.onerror = function() {
            alert('Could not load that image. Try a different file.');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveProfile() {
    var newName = document.getElementById('edit-name').value.trim();
    var newUsername = document.getElementById('edit-username').value.trim();
    var saveBtn = document.querySelector('#edit-profile-modal .btn-save');

    if (!newName || newName.length < 2) {
        alert('Name must be at least 2 characters.');
        return;
    }

    if (!newUsername || newUsername.length < 3) {
        alert('Username must be at least 3 characters.');
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
        alert('Username can only contain letters, numbers, and underscores.');
        return;
    }

    var payload = {
        name: newName,
        username: newUsername.toLowerCase()
    };

    if (pendingAvatarRemoved) {
        payload.avatar = '';
    } else if (pendingAvatar) {
        payload.avatar = pendingAvatar;
    }

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }

    apiFetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
    }).then(function(data) {
        renderProfile(data.user);
        pendingAvatar = null;
        pendingAvatarRemoved = false;
        closeEditProfileModal();
        alert('Profile updated successfully.');
    }).catch(function(err) {
        alert(err.message || 'Failed to save profile.');
    }).finally(function() {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    });
}

function populatePreferencesModal(prefs) {
    prefs = prefs || { genres: [], contentRating: 'All', notifications: {} };
    var genres = prefs.genres || [];
    var contentRating = prefs.contentRating || 'All';

    document.querySelectorAll('.genre-chip input').forEach(function(cb) {
        cb.checked = genres.indexOf(cb.value) !== -1;
    });

    document.querySelectorAll('input[name="content-rating"]').forEach(function(radio) {
        radio.checked = radio.value === contentRating;
    });
    if (!document.querySelector('input[name="content-rating"]:checked')) {
        var allRadio = document.querySelector('input[name="content-rating"][value="All"]');
        if (allRadio) allRadio.checked = true;
    }

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
    var saveBtn = document.querySelector('#preferences-modal .btn-save');

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }

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
        updateSessionUser(data.user);
        alert('Preferences saved!');
        closePreferencesModal();
    }).catch(function(err) {
        alert(err.message);
    }).finally(function() {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    });
}

function clearHistory() {
    if (!confirm('Clear all watch history? This cannot be undone.')) return;

    apiFetch('/api/history', { method: 'DELETE' }).then(function() {
        alert('Watch history cleared.');
        loadHistory();
    }).catch(function(err) {
        alert(err.message);
    });
}

window.addEventListener('load', function() {
    loadProfilePage();

    var passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', savePassword);
    }

    var passwordModal = document.getElementById('password-modal');
    if (passwordModal) {
        passwordModal.addEventListener('click', function(e) {
            if (e.target === passwordModal) closeChangePasswordModal();
        });
        var passwordBox = passwordModal.querySelector('.modal-box');
        if (passwordBox) {
            passwordBox.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
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
