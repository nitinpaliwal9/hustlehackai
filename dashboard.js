// Dashboard Script - HustleHack AI

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Dashboard Navigation
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const target = this.getAttribute('href').replace('#', 'dash-');
            showDashboardSection(target);
        });
    });

    // Initialize Profile Form Submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileFormSubmit);
    }

    // Initialize Password Form Submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordFormSubmit);
    }
});

function showDashboardSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionId.replace('dash-', '')}"]`).classList.add('active');
}

function handleProfileFormSubmit(event) {
    event.preventDefault();
    // Handle profile form logic here
    console.log('Profile form submitted');
    showNotification('👤 Profile updated successfully!', 'success');
}

function handlePasswordFormSubmit(event) {
    event.preventDefault();
    // Handle password change logic here
    console.log('Password form submitted');
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (newPassword === confirmPassword) {
        showNotification('🔐 Password updated successfully!', 'success');
    } else {
        showNotification('❌ Passwords do not match.', 'error');
    }
}

function showNotification(message, type) {
    // Implement notification display
    console.log(`${type}:`, message);
}

function cancelSubscription() {
    // Implement subscription cancellation logic
    console.log('Cancel subscription clicked');
    showNotification('📄 Subscription cancelled.', 'info');
}

function filterActivity(type) {
    // Add filter logic for the activity section
    document.querySelectorAll('.timeline-item').forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.filter-btn[onclick="filterActivity('${type}')"]`).classList.add('active');
}
