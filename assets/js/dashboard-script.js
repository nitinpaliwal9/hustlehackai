// ====================================
// HUSTLEHACK AI - DASHBOARD SCRIPT 3.0
// Real-time Supabase Backend Integration
// Dynamic User Data & Usage Tracking
// ====================================

// Initialize Supabase
const supabase = window.supabase.createClient(
    'https://bmgvtzwesdkitdjfszsh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZ3Z0endlc2RraXRkamZzenNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODExNjksImV4cCI6MjA2NzY1NzE2OX0.55QH6xY6nvvRs17WbHfMiVT6Yh3MWcuKtOVQ7vuEVvU'
);

// Global state
let currentUser = null;
let userProfile = null;
let usageStats = null;
let availableResources = [];
let recentActivity = [];
let isLoading = true;

// DOM Elements Cache
const elements = {
    // Loading and content areas
    loadingScreen: document.getElementById('loadingScreen'),
    
    // User profile elements
    sidebarUserName: document.getElementById('sidebarUserName'),
    sidebarUserRole: document.getElementById('sidebarUserRole'),
    userProfileName: document.getElementById('userProfileName'),
    userPlanName: document.getElementById('userPlanName'),
    userPlanBadge: document.getElementById('userPlanBadge'),
    
    // Plan status elements
    planUsagePercent: document.getElementById('planUsagePercent'),
    planProgressFill: document.getElementById('planProgressFill'),
    planUsageText: document.getElementById('planUsageText'),
    daysRemaining: document.getElementById('daysRemaining'),
    planRenewal: document.getElementById('planRenewal'),
    btnRenewPlan: document.getElementById('btnRenewPlan'),
    
    // Navigation and sections
    sidebarLinks: document.querySelectorAll('.sidebar-link'),
    dashboardSections: document.querySelectorAll('.dashboard-section'),
    resourceCount: document.getElementById('resourceCount'),
    activityDot: document.getElementById('activityDot'),
    
    // Mobile
    mobileSidebarToggle: document.getElementById('mobileSidebarToggle'),
    dashboardSidebar: document.getElementById('dashboardSidebar')
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing HustleHack AI Dashboard...');
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        console.log('🔄 Starting dashboard initialization...');
        
        // Set a timeout to force-hide loading screen if it takes too long
        const timeoutId = setTimeout(() => {
            console.warn('⚠️ Dashboard loading timed out, hiding loading screen');
            hideLoadingScreen();
            showToast('Dashboard loaded with some delays. Please check your connection.', 'warning');
        }, 15000); // 15 second timeout
        
        // Check authentication first
        console.log('🔍 Checking authentication...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            console.error('❌ Authentication failed:', error);
            clearTimeout(timeoutId);
            redirectToLogin();
            return;
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', user.email);
        
        // Load all dashboard data in parallel with individual error handling
        console.log('📊 Loading dashboard data...');
        const dataPromises = [
            loadUserProfile().catch(err => {
                console.error('❌ Profile load failed:', err);
                throw err; // Re-throw to handle in main catch
            }),
            loadUsageStats().catch(err => {
                console.warn('⚠️ Usage stats load failed:', err);
                return null; // Don't fail entire initialization
            }),
            loadAvailableResources().catch(err => {
                console.warn('⚠️ Resources load failed:', err);
                return null; // Don't fail entire initialization
            }),
            loadRecentActivity().catch(err => {
                console.warn('⚠️ Activity load failed:', err);
                return null; // Don't fail entire initialization
            })
        ];
        
        await Promise.all(dataPromises);
        console.log('✅ Dashboard data loaded');
        
        // Initialize UI components
        console.log('🎨 Initializing UI components...');
        initializeNavigation();
        initializeMobileMenu();
        initializeRealTimeFeatures();
        
        // Update UI with loaded data
        console.log('🔄 Updating user interface...');
        updateUserInterface();
        
        // Clear timeout and hide loading screen
        clearTimeout(timeoutId);
        hideLoadingScreen();
        
        console.log('✅ Dashboard initialized successfully!');
        showToast('Welcome back! Dashboard loaded successfully.', 'success');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showToast('Failed to load dashboard. Please refresh the page.', 'error');
        hideLoadingScreen();
    }
}

// ====================================
// AUTHENTICATION & UTILITIES
// ====================================

function redirectToLogin() {
    console.log('🔄 Redirecting to login...');
    window.location.href = '/pages/login.html';
}

// ====================================
// DATA LOADING FUNCTIONS
// ====================================

// Load user profile from database
async function loadUserProfile() {
    try {
        console.log('👤 Loading user profile...');
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('❌ Error loading user profile:', error);
            if (error.code === 'PGRST116') {
                console.log('📝 Profile not found, redirecting to complete profile');
                window.location.href = '/complete-profile.html';
                return;
            }
            throw error;
        }
        
        userProfile = data;
        console.log('✅ User profile loaded:', userProfile.name);
        
    } catch (error) {
        console.error('❌ Failed to load user profile:', error);
        throw error;
    }
}

// Load usage statistics
async function loadUsageStats() {
    try {
        console.log('📊 Loading usage statistics...');
        
        // Get total usage count
        const { data: allUsage, error: totalError } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', currentUser.id);
        
        if (totalError) throw totalError;
        
        // Get usage for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentUsage, error: recentError } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', currentUser.id)
            .gte('timestamp', sevenDaysAgo.toISOString());
        
        if (recentError) throw recentError;
        
        // Group usage by type
        const usageByType = allUsage.reduce((acc, log) => {
            acc[log.action_type] = (acc[log.action_type] || 0) + 1;
            return acc;
        }, {});
        
        usageStats = {
            total: allUsage.length,
            recent: recentUsage.length,
            byType: usageByType,
            logs: allUsage
        };
        
        console.log('✅ Usage statistics loaded:', usageStats);
        
    } catch (error) {
        console.error('❌ Failed to load usage statistics:', error);
        usageStats = { total: 0, recent: 0, byType: {}, logs: [] };
    }
}

// Load available resources based on user's plan
async function loadAvailableResources() {
    try {
        console.log('🎁 Loading available resources...');
        
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Filter resources based on user's plan
        const userPlan = userProfile?.plan || 'starter';
        const planHierarchy = { starter: 1, creator: 2, pro: 3 };
        const userPlanLevel = planHierarchy[userPlan] || 1;
        
        availableResources = data.filter(resource => {
            const resourcePlanLevel = planHierarchy[resource.plan_required] || 1;
            return resourcePlanLevel <= userPlanLevel;
        });
        
        console.log(`✅ Loaded ${availableResources.length} resources for ${userPlan} plan`);
        
        // Update resource count in sidebar
        if (elements.resourceCount) {
            elements.resourceCount.textContent = availableResources.length;
        }
        
    } catch (error) {
        console.error('❌ Failed to load resources:', error);
        availableResources = [];
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        console.log('⚡ Loading recent activity...');
        
        const { data, error } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('timestamp', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        recentActivity = data;
        console.log(`✅ Loaded ${data.length} recent activities`);
        
    } catch (error) {
        console.error('❌ Failed to load recent activity:', error);
        recentActivity = [];
    }
}

// ====================================
// UI UPDATE FUNCTIONS
// ====================================

// Update user interface with loaded data
function updateUserInterface() {
    updateUserProfile();
    updatePlanStatus();
    updateNavigationCounts();
    updateOverviewSection();
}

// Update user profile display
function updateUserProfile() {
    if (!userProfile) return;
    
    // Update sidebar user info
    if (elements.sidebarUserName) {
        elements.sidebarUserName.textContent = userProfile.name || 'User';
    }
    
    if (elements.sidebarUserRole) {
        elements.sidebarUserRole.textContent = userProfile.role ? 
            userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 
            'Member';
    }
    
    // Update navbar profile name
    if (elements.userProfileName) {
        elements.userProfileName.textContent = userProfile.name || 'User';
    }
    
    // Update plan badge
    if (elements.userPlanName) {
        const planName = userProfile.plan || 'starter';
        elements.userPlanName.textContent = planName.charAt(0).toUpperCase() + planName.slice(1);
    }
    
    console.log('✅ User profile UI updated');
}

// Update plan status display
function updatePlanStatus() {
    if (!userProfile) return;
    
    const planExpiry = userProfile.plan_expiry ? new Date(userProfile.plan_expiry) : null;
    const now = new Date();
    
    if (planExpiry) {
        const daysRemaining = Math.ceil((planExpiry - now) / (1000 * 60 * 60 * 24));
        const isExpired = daysRemaining <= 0;
        const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
        
        // Update days remaining
        if (elements.daysRemaining) {
            if (isExpired) {
                elements.daysRemaining.textContent = 'Expired';
                elements.daysRemaining.style.color = '#ef4444';
            } else {
                elements.daysRemaining.textContent = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
                elements.daysRemaining.style.color = isExpiringSoon ? '#f59e0b' : '#22c55e';
            }
        }
        
        // Update progress bar (based on usage)
        const totalUsage = usageStats?.total || 0;
        const mockMaxUsage = 100; // You can make this dynamic based on plan
        const usagePercent = Math.min((totalUsage / mockMaxUsage) * 100, 100);
        
        if (elements.planUsagePercent) {
            elements.planUsagePercent.textContent = `${Math.round(usagePercent)}%`;
        }
        if (elements.planProgressFill) {
            elements.planProgressFill.style.width = `${usagePercent}%`;
        }
        if (elements.planUsageText) {
            elements.planUsageText.textContent = `${totalUsage} resources accessed`;
        }
    }
    
    console.log('✅ Plan status UI updated');
}

// Update navigation counts and indicators
function updateNavigationCounts() {
    // Update activity indicator
    if (elements.activityDot && usageStats?.recent > 0) {
        elements.activityDot.style.display = 'block';
    }
    
    console.log('✅ Navigation counts updated');
}

// Update overview section with stats
function updateOverviewSection() {
    // Update overview stats cards if they exist
    const statsElements = {
        totalUsage: document.querySelector('#stat-total-usage'),
        recentActivity: document.querySelector('#stat-recent-activity'),
        availableResources: document.querySelector('#stat-available-resources'),
        planStatus: document.querySelector('#stat-plan-status')
    };
    
    if (statsElements.totalUsage) {
        statsElements.totalUsage.textContent = usageStats?.total || 0;
    }
    
    if (statsElements.recentActivity) {
        statsElements.recentActivity.textContent = usageStats?.recent || 0;
    }
    
    if (statsElements.availableResources) {
        statsElements.availableResources.textContent = availableResources.length;
    }
    
    if (statsElements.planStatus && userProfile) {
        statsElements.planStatus.textContent = userProfile.plan || 'starter';
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

// ====================================
// USER ACTION LOGGING
// ====================================

// Log user action to database
async function logUserAction(actionType, resourceName) {
    try {
        if (!currentUser) return;
        
        const { error } = await supabase
            .from('usage_logs')
            .insert([{
                user_id: currentUser.id,
                action_type: actionType,
                resource_name: resourceName
            }]);
        
        if (error) {
            console.error('❌ Failed to log action:', error);
            return;
        }
        
        console.log(`✅ Logged action: ${actionType} - ${resourceName}`);
        
        // Update local usage stats
        if (usageStats) {
            usageStats.total += 1;
            usageStats.recent += 1;
            usageStats.byType[actionType] = (usageStats.byType[actionType] || 0) + 1;
            
            // Update UI counters
            updateNavigationCounts();
            updatePlanStatus();
        }
        
    } catch (error) {
        console.error('❌ Error logging action:', error);
    }
}

// Helper functions for common actions
async function logResourceView(resourceName) {
    await logUserAction('viewed', resourceName);
}

async function logResourceDownload(resourceName) {
    await logUserAction('downloaded', resourceName);
}

async function logButtonClick(buttonName) {
    await logUserAction('clicked', buttonName);
}

// ====================================
// NAVIGATION & SECTION MANAGEMENT
// ====================================

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
        quickAccessBtn.addEventListener('click', async () => {
            await logButtonClick('Quick Access');
            showToast('🚀 Quick access feature coming soon!', 'info');
        });
    }
    
    if (newContentBtn) {
        newContentBtn.addEventListener('click', async () => {
            await logButtonClick('New Content');
            showToast('🎨 Content creation tools coming soon!', 'info');
        });
    }
}

function navigateToSection(sectionName) {
    console.log(`🔄 Navigating to section: ${sectionName}`);
    
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
        
        // Load section-specific data
        loadSectionData(sectionName);
        
        // Log section view
        logButtonClick(`Dashboard Section: ${sectionName}`);
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

// Load data for specific section
async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'resources':
            await loadAndDisplayResources();
            break;
        case 'activity':
            await loadAndDisplayActivity();
            break;
        case 'profile':
            await loadAndDisplayProfile();
            break;
        case 'billing':
            await loadAndDisplayBilling();
            break;
        default:
            console.log(`📄 Loading overview section`);
    }
}

// Load and display resources section
async function loadAndDisplayResources() {
    console.log('🎁 Loading resources section...');
    
    const resourcesContainer = document.querySelector('#dash-resources .resources-grid');
    if (!resourcesContainer) return;
    
    if (availableResources.length === 0) {
        resourcesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No Resources Available</h3>
                <p>Check back soon for new resources!</p>
            </div>
        `;
        return;
    }
    
    // Render resources
    resourcesContainer.innerHTML = availableResources.map(resource => `
        <div class="resource-card" onclick="handleResourceClick('${resource.id}', '${resource.title}')">
            <div class="resource-header">
                <span class="resource-type">${resource.type}</span>
                <span class="resource-plan">${resource.plan_required}</span>
            </div>
            <h4 class="resource-title">${resource.title}</h4>
            <p class="resource-description">${resource.description || 'No description available'}</p>
            <div class="resource-actions">
                <button class="btn btn-primary" onclick="downloadResource('${resource.id}', '${resource.title}')">
                    📥 Download
                </button>
                <button class="btn btn-ghost" onclick="viewResource('${resource.id}', '${resource.title}')">
                    👁️ View
                </button>
            </div>
        </div>
    `).join('');
}

// Load and display activity section
async function loadAndDisplayActivity() {
    console.log('⚡ Loading activity section...');
    
    const activityContainer = document.querySelector('#dash-activity .activity-list');
    if (!activityContainer) return;
    
    if (recentActivity.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Activity Yet</h3>
                <p>Start exploring resources to see your activity here!</p>
            </div>
        `;
        return;
    }
    
    // Render activity list
    activityContainer.innerHTML = recentActivity.map(activity => {
        const timeAgo = getTimeAgo(new Date(activity.timestamp));
        const actionEmoji = {
            viewed: '👁️',
            downloaded: '📥',
            clicked: '🖱️'
        };
        
        return `
            <div class="activity-item">
                <div class="activity-icon">${actionEmoji[activity.action_type] || '📋'}</div>
                <div class="activity-details">
                    <span class="activity-action">${activity.action_type}</span>
                    <span class="activity-resource">${activity.resource_name}</span>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Load and display profile section
async function loadAndDisplayProfile() {
    console.log('👤 Loading profile section...');
    // Profile editing functionality can be added here
}

// Load and display billing section
async function loadAndDisplayBilling() {
    console.log('💳 Loading billing section...');
    // Billing management functionality can be added here
}

// ====================================
// RESOURCE INTERACTION HANDLERS
// ====================================

// Handle resource card click
async function handleResourceClick(resourceId, resourceName) {
    console.log(`🖱️ Resource clicked: ${resourceName}`);
    await logResourceView(resourceName);
    showToast(`Viewing: ${resourceName}`, 'info');
}

// Handle resource download
async function downloadResource(resourceId, resourceName) {
    console.log(`📥 Downloading resource: ${resourceName}`);
    await logResourceDownload(resourceName);
    showToast(`Downloaded: ${resourceName}`, 'success');
}

// Handle resource view
async function viewResource(resourceId, resourceName) {
    console.log(`👁️ Viewing resource: ${resourceName}`);
    await logResourceView(resourceName);
    showToast(`Viewing: ${resourceName}`, 'info');
}

// ====================================
// MOBILE MENU MANAGEMENT
// ====================================

function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('dashboardSidebar');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', async () => {
            sidebar.classList.toggle('mobile-open');
            document.body.classList.toggle('sidebar-open');
            await logButtonClick('Mobile Sidebar Toggle');
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

// ====================================
// REAL-TIME FEATURES
// ====================================

function initializeRealTimeFeatures() {
    // Update time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute
    
    // Plan renewal countdown
    updatePlanCountdown();
    setInterval(updatePlanCountdown, 3600000); // Update every hour
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
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }
}

function updatePlanCountdown() {
    if (!userProfile || !userProfile.plan_expiry) return;
    
    const planExpiry = new Date(userProfile.plan_expiry);
    const now = new Date();
    const daysRemaining = Math.ceil((planExpiry - now) / (1000 * 60 * 60 * 24));
    
    // Update any plan countdown displays
    const countdownElements = document.querySelectorAll('.plan-countdown');
    countdownElements.forEach(element => {
        if (daysRemaining <= 0) {
            element.textContent = 'Expired';
            element.className = 'plan-countdown expired';
        } else if (daysRemaining <= 7) {
            element.textContent = `${daysRemaining} days left`;
            element.className = 'plan-countdown warning';
        } else {
            element.textContent = `${daysRemaining} days left`;
            element.className = 'plan-countdown active';
        }
    });
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

// Calculate time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Show notification toast
function showToast(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    console.log(`📢 Toast: ${message} (${type})`);
}

// Show error message
function showError(message) {
    showToast(message, 'error');
}

// ====================================
// AUTHENTICATION HANDLERS
// ====================================

// Handle user sign out
async function handleUserSignOut() {
    try {
        console.log('👋 Signing out...');
        await logButtonClick('Sign Out');
        
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        showToast('Signed out successfully', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Sign out error:', error);
        showError('Failed to sign out. Please try again.');
    }
}

// ====================================
// EVENT LISTENERS & INITIALIZATION
// ====================================

// Plan renewal button
if (elements.btnRenewPlan) {
    elements.btnRenewPlan.addEventListener('click', async () => {
        await logButtonClick('Renew Plan');
        showToast('Plan renewal coming soon!', 'info');
    });
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event);
    
    if (event === 'SIGNED_OUT') {
        window.location.href = '/index.html';
    }
});

// Make functions available globally
window.showDashboardSection = navigateToSection;
window.handleUserSignOut = handleUserSignOut;
window.handleResourceClick = handleResourceClick;
window.downloadResource = downloadResource;
window.viewResource = viewResource;
window.showToast = showToast;

console.log('✅ Dashboard script loaded successfully!');

// ====================================
// WELCOME MESSAGE WITH USER DATA
// ====================================

// Add welcome message with real user data once loaded
function showWelcomeMessage() {
    if (userProfile && usageStats) {
        const welcomeMessage = `Welcome back, ${userProfile.name}! You have ${usageStats.recent} recent activities and ${availableResources.length} resources available.`;
        showToast(welcomeMessage, 'success');
    }
}
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
