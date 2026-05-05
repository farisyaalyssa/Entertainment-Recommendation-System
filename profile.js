// ── Tab switching ──────────────────────────────
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

// ── Change Password Modal ──────────────────────
function openChangePasswordModal() {
    document.getElementById('password-modal').style.display = 'flex';
}

function closeChangePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
}

// ── Delete / Deactivate Modal ──────────────────
var selectedOption = null;

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

function confirmAction() {
    if (selectedOption === 'deactivate') {
        alert('Account deactivated.');
    } else {
        alert('Account deleted.');
    }
    closeDeleteModal();
}

// ── Edit Profile Modal ─────────────────────────
function openEditProfileModal() {
    document.getElementById('edit-profile-modal').style.display = 'flex';
}

function closeEditProfileModal() {
    document.getElementById('edit-profile-modal').style.display = 'none';
}

function previewAvatar(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        var preview = document.getElementById('avatar-preview');
        preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">';
    };
    reader.readAsDataURL(file);
}

function saveProfile() {
    var newName = document.getElementById('edit-name').value.trim();
    var newUsername = document.getElementById('edit-username').value.trim();
    if (newName) {
        document.querySelector('.profile-name').textContent = newName;
        document.querySelector('.nav-avatar').textContent = newName.charAt(0).toUpperCase();
    }
    if (newUsername) {
        document.querySelector('.profile-username').textContent = '@' + newUsername;
    }
    closeEditProfileModal();
}

// ── Event listeners (run after page loads) ────
window.addEventListener('load', function() {
    document.getElementById('password-modal').addEventListener('click', function(e) {
        if (e.target === this) closeChangePasswordModal();
    });
    document.getElementById('delete-modal').addEventListener('click', function(e) {
        if (e.target === this) closeDeleteModal();
    });
    document.getElementById('edit-profile-modal').addEventListener('click', function(e) {
        if (e.target === this) closeEditProfileModal();
    });
});