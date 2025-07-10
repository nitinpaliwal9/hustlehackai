// Dashboard Script - HustleHack AI

let currentUser = null;
let userProfile = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuthenticationStatus();
    
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
    
    // Load initial data
    loadDashboardData();
});

// Check if user is authenticated and redirect if not
async function checkAuthenticationStatus() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth check error:', error);
            redirectToLogin();
            return;
        }
        
        if (!session || !session.user) {
            redirectToLogin();
            return;
        }
        
        currentUser = session.user;
        
        // Load user profile data
        await loadUserProfile();
        
        // Update UI with user data
        updateUserInterface();
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        redirectToLogin();
    }
}

function redirectToLogin() {
    window.location.href = 'index.html';
}

// Load user profile from database
async function loadUserProfile() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('Error loading user profile:', error);
            return;
        }
        
        userProfile = data;
        
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
}

// Update UI with user data
function updateUserInterface() {
    if (!currentUser) return;
    
    const userName = userProfile?.name || currentUser.user_metadata?.name || currentUser.email.split('@')[0];
    const userEmail = currentUser.email;
    
    // Update profile name in header
    const profileNameEl = document.getElementById('userProfileName');
    if (profileNameEl) {
        profileNameEl.textContent = userName;
    }
    
    // Update profile form fields
    const profileNameInput = document.getElementById('profileName');
    const profileEmailInput = document.getElementById('profileEmail');
    const profileRoleSelect = document.getElementById('profileRole');
    
    if (profileNameInput) profileNameInput.value = userName;
    if (profileEmailInput) profileEmailInput.value = userEmail;
    if (profileRoleSelect && userProfile?.role) {
        profileRoleSelect.value = userProfile.role;
    }
    
    // Update dashboard stats
    updateDashboardStats();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load user activity logs
        await loadUserActivity();
        
        // Load user resource usage
        await loadResourceUsage();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    // Calculate days since joining
    const joinDate = userProfile?.timestamp || currentUser.created_at;
    if (joinDate) {
        const daysSinceJoin = Math.floor((new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24));
        const daysSinceJoinEl = document.getElementById('daysSinceJoin');
        if (daysSinceJoinEl) {
            daysSinceJoinEl.textContent = daysSinceJoin;
        }
    }
    
    // Update plan name
    const currentPlanEl = document.getElementById('currentPlan');
    const planNameEl = document.getElementById('planName');
    const plan = userProfile?.plan || 'Pro';
    
    if (currentPlanEl) currentPlanEl.textContent = plan;
    if (planNameEl) planNameEl.textContent = `${plan} Plan`;
}

// Load user activity logs
async function loadUserActivity() {
    // This would typically load from a user_activity table
    // For now, we'll use static data but structure it for real implementation
    console.log('Loading user activity...');
}

// Load resource usage data
async function loadResourceUsage() {
    // This would load from a user_resource_usage table
    console.log('Loading resource usage...');
}

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
