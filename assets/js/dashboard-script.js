// ========================================
//    HUSTLEHACK AI - DASHBOARD SCRIPT 2.0
//    Enhanced, Mobile-First, Feature-Rich
// ========================================

let currentUser = null;
let userProfile = null;
let isLoading = true;
let dashboardData = {
    stats: {},
    activity: [],
    resources: [],
    notifications: []
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing HustleHack AI Dashboard...');
    
    // Start loading sequence
    showLoadingScreen();
    
    // Initialize components
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // Check authentication
        await checkAuthenticationStatus();
        
        // Initialize UI components
        initializeNavigation();
        initializeMobileMenu();
        initializeNotifications();
        initializeSearch();
        initializeRealTimeFeatures();
        
        // Load dashboard data
        await loadAllDashboardData();
        
        // Hide loading screen
        hideLoadingScreen();
        
        console.log('✅ Dashboard initialized successfully!');
        showToast('Welcome back! Dashboard loaded successfully.', 'success');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showToast('Failed to load dashboard. Please refresh the page.', 'error');
        hideLoadingScreen();
    }
}

// Loading Screen Management
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// Enhanced Navigation
function initializeNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Quick action buttons
    const quickAccessBtn = document.getElementById('quickAccessBtn');
    const newContentBtn = document.getElementById('newContentBtn');
    
    if (quickAccessBtn) {
        quickAccessBtn.addEventListener('click', openQuickAccessModal);
    }
    
    if (newContentBtn) {
        newContentBtn.addEventListener('click', () => {
            showToast('🎨 Opening content creation tools...', 'info');
            // Add navigation to content creation section
        });
    }
}

function navigateToSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`dash-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update navigation state
        updateNavigationState(sectionName);
        
        // Trigger section-specific actions
        onSectionChange(sectionName);
    }
}

function updateNavigationState(activeSection) {
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${activeSection}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function onSectionChange(sectionName) {
    switch(sectionName) {
        case 'resources':
            loadResourcesData();
            break;
        case 'activity':
            loadActivityData();
            break;
        case 'billing':
            loadBillingData();
            break;
        case 'support':
            initializeSupportFeatures();
            break;
    }
}

// Mobile Menu Management
function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('dashboardSidebar');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            document.body.classList.toggle('sidebar-open');
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
                document.body.classList.remove('sidebar-open');
            }
        });
    }
}

// Real-time Features
function initializeRealTimeFeatures() {
    // Update time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Counter animations
    animateCounters();
    
    // Plan renewal countdown
    updatePlanCountdown();
    setInterval(updatePlanCountdown, 3600000); // Update every hour
    
    // Initialize plan alert
    initializePlanAlert();
}

function updateCurrentTime() {
    const timeElement = document.querySelector('.current-time .time');
    const dateElement = document.querySelector('.current-time .date');
    
    if (timeElement && dateElement) {
        const now = new Date();
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        };
        const dateOptions = { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        };
        
        timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 50;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                setTimeout(updateCounter, 40);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

function updatePlanCountdown() {
    // Calculate days remaining (demo data)
    const renewalDate = new Date('2025-01-11');
    const today = new Date();
    const daysRemaining = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    
    const elements = document.querySelectorAll('#daysRemaining, #alertDaysLeft');
    elements.forEach(el => {
        if (el) el.textContent = `${daysRemaining} days left`;
    });
    
    // Update urgency styling
    if (daysRemaining <= 7) {
        document.querySelectorAll('.plan-renewal').forEach(el => {
            el.style.color = 'var(--error)';
        });
    }
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('dashboardSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(e);
            }
        });
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) return;
    
    // Simulate search results
    const searchResults = [
        'AI Content Generator',
        'Social Media Templates',
        'Study Productivity Tools',
        'Business Plan Template',
        'Resume Builder'
    ].filter(item => item.toLowerCase().includes(query));
    
    if (searchResults.length > 0) {
        showToast(`Found ${searchResults.length} results for "${query}"`, 'info');
    } else {
        showToast(`No results found for "${query}"`, 'warning');
    }
}

// Notifications
function initializeNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotificationsModal);
    }
    
    // Simulate real-time notifications
    setTimeout(() => {
        addNotification('New weekly AI tools are available!', 'info');
    }, 5000);
}

function showNotificationsModal() {
    const notifications = [
        {
            id: 1,
            title: 'Plan Renewal Reminder',
            message: 'Your Pro plan expires in 12 days',
            type: 'warning',
            time: '2 hours ago'
        },
        {
            id: 2,
            title: 'New Content Available',
            message: 'Weekly AI prompt pack is ready',
            type: 'info',
            time: '1 day ago'
        },
        {
            id: 3,
            title: 'Resource Usage Alert',
            message: 'You\'ve used 75% of your monthly resources',
            type: 'warning',
            time: '3 days ago'
        }
    ];
    
    showToast('📬 You have 3 new notifications', 'info');
    // Here you would typically show a modal with notifications
}

function addNotification(message, type) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const count = parseInt(badge.textContent) + 1;
        badge.textContent = count;
        badge.style.display = 'block';
    }
    
    showToast(message, type);
}

// Plan Alert Management
function initializePlanAlert() {
    const alertDismiss = document.getElementById('btnAlertDismiss');
    const alertRenew = document.getElementById('btnAlertRenew');
    const planAlert = document.getElementById('planAlert');
    
    if (alertDismiss) {
        alertDismiss.addEventListener('click', () => {
            planAlert.style.display = 'none';
            showToast('Reminder dismissed', 'info');
        });
    }
    
    if (alertRenew) {
        alertRenew.addEventListener('click', () => {
            navigateToSection('billing');
            showToast('Redirecting to billing...', 'info');
        });
    }
}

// Support Features
function initializeSupportFeatures() {
    const supportButtons = document.querySelectorAll('.btn-support');
    
    supportButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.closest('.btn-support').getAttribute('data-action');
            handleSupportAction(action);
        });
    });
}

function handleSupportAction(action) {
    switch(action) {
        case 'telegram':
            window.open('https://t.me/hustlehackai', '_blank');
            showToast('Opening Telegram community...', 'success');
            break;
        case 'email':
            window.location.href = 'mailto:support@hustlehackai.com';
            showToast('Opening email client...', 'success');
            break;
        case 'kb':
            showToast('Loading knowledge base...', 'info');
            break;
        case 'videos':
            showToast('Opening video tutorials...', 'info');
            break;
    }
}

// Quick Access Modal
function openQuickAccessModal() {
    const modal = document.getElementById('quickAccessModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeQuickAccessModal() {
    const modal = document.getElementById('quickAccessModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

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

// Modern Toast System
function showToast(message, type = 'info', duration = 4000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        createToastContainer();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${icons[type]}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="removeToast(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="toast-progress"></div>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => removeToast(toast), duration);
    
    return toast;
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
}

function removeToast(toast) {
    if (typeof toast === 'object' && toast.classList) {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    } else {
        // Called from button click
        const toastElement = toast.closest('.toast');
        removeToast(toastElement);
    }
}

// Enhanced Data Loading
async function loadAllDashboardData() {
    try {
        console.log('📊 Loading dashboard data...');
        
        // Simulate API calls with realistic delays
        await Promise.all([
            loadUserProfile(),
            loadUserStats(),
            loadRecentActivity(),
            loadResourcesData(),
            loadNotifications()
        ]);
        
        console.log('✅ All dashboard data loaded');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        throw error;
    }
}

async function loadUserStats() {
    // Simulate loading user statistics
    const stats = {
        resourcesUsed: 47,
        totalResources: 156,
        planUsagePercent: 65,
        daysActive: 23,
        dailyStreak: 7
    };
    
    // Update UI with stats
    Object.keys(stats).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = stats[key];
            if (element.hasAttribute('data-target')) {
                element.setAttribute('data-target', stats[key]);
            }
        }
    });
    
    dashboardData.stats = stats;
}

async function loadRecentActivity() {
    // Simulate loading recent activity
    const activities = [
        {
            type: 'resources',
            icon: 'fas fa-mobile-alt',
            title: 'Social Media Prompt Pack accessed',
            description: 'Downloaded prompts for Instagram content creation',
            time: '2 hours ago'
        },
        {
            type: 'account',
            icon: 'fas fa-user',
            title: 'Profile updated',
            description: 'Changed role from Student to Content Creator',
            time: '1 day ago'
        },
        {
            type: 'resources',
            icon: 'fas fa-palette',
            title: 'Creator AI Toolkit downloaded',
            description: 'Accessed advanced creator tools package',
            time: '1 day ago'
        }
    ];
    
    dashboardData.activity = activities;
}

// FAQ Toggle Function
function toggleFAQ(button) {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const icon = button.querySelector('i');
    
    const isOpen = answer.style.display === 'block';
    
    // Close all other FAQs
    document.querySelectorAll('.faq-answer').forEach(ans => {
        ans.style.display = 'none';
    });
    document.querySelectorAll('.faq-question i').forEach(ic => {
        ic.style.transform = 'rotate(0deg)';
    });
    
    // Toggle current FAQ
    if (!isOpen) {
        answer.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    }
}

// Activity Filter Function
function filterActivity(type) {
    document.querySelectorAll('.timeline-item').forEach(item => {
        const itemType = item.getAttribute('data-type');
        if (type === 'all' || itemType === type) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[onclick="filterActivity('${type}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

// Export functions for global use
window.navigateToSection = navigateToSection;
window.toggleFAQ = toggleFAQ;
window.filterActivity = filterActivity;
window.showToast = showToast;
window.openQuickAccessModal = openQuickAccessModal;
window.closeQuickAccessModal = closeQuickAccessModal;
window.handleSupportAction = handleSupportAction;

console.log('🎯 HustleHack AI Dashboard Script 2.0 loaded successfully!');

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Dashboard Error:', e.error);
    showToast('An unexpected error occurred. Please refresh the page.', 'error');
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            console.log(`📈 Dashboard loaded in ${loadTime.toFixed(2)}ms`);
        }, 0);
    });
}
