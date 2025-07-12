// ====================================
// BACKUP: Original dashboard script with improved error handling
// This file contains the fixed version of the dashboard loading logic
// ====================================

// Option 1: Auto-initialize new users (if you want this approach)
async function autoInitializeNewUser(user) {
    try {
        console.log('🔄 Auto-initializing new user profile...');
        
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    id: user.id,
                    email: user.email,
                    name: user.email.split('@')[0] || 'User',
                    role: 'student', // default role
                    plan: 'starter', // default plan
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to auto-initialize user:', error);
            throw error;
        }

        console.log('✅ User auto-initialized successfully');
        return data;
    } catch (error) {
        console.error('❌ Auto-initialization failed:', error);
        throw error;
    }
}

// Option 2: Enhanced profile check with auto-initialization option
async function checkAndInitializeUser(user, autoInitialize = false) {
    try {
        console.log('👤 Checking user profile...');
        
        const { data: userRow, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profileError) {
            if (profileError.code === 'PGRST116') {
                // No profile found
                console.log('📝 No profile found for user:', user.email);
                
                if (autoInitialize) {
                    // Auto-initialize the user
                    const newProfile = await autoInitializeNewUser(user);
                    return { userProfile: newProfile, isNewUser: true };
                } else {
                    // Redirect to complete profile
                    return { userProfile: null, isNewUser: true, needsRedirect: true };
                }
            } else {
                // Other database error
                console.error('❌ Profile check failed:', profileError);
                throw profileError;
            }
        } else {
            // Profile exists
            console.log('✅ User profile found:', userRow.name);
            return { userProfile: userRow, isNewUser: false };
        }
    } catch (error) {
        console.error('❌ User check failed:', error);
        throw error;
    }
}

// Enhanced dashboard initialization with robust error handling
async function initializeDashboardRobust(options = {}) {
    const { autoInitializeUsers = false, fallbackToDemo = false } = options;
    
    try {
        console.log('🚀 Starting robust dashboard initialization...');
        
        // Set loading timeout
        const timeoutId = setTimeout(() => {
            console.warn('⚠️ Dashboard loading timed out');
            hideLoadingScreen();
            showToast('Dashboard loaded with delays. Some features may be limited.', 'warning');
        }, 15000);
        
        // Check authentication
        console.log('🔍 Checking authentication...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ Authentication failed:', authError);
            if (fallbackToDemo) {
                console.log('🎭 Loading in demo mode...');
                // Load demo data here
                clearTimeout(timeoutId);
                hideLoadingScreen();
                showToast('Loaded in demo mode. Sign in for full features.', 'info');
                return;
            } else {
                console.log('🔄 Redirecting to login...');
                window.location.href = '/pages/login.html';
                return;
            }
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', user.email);
        
        // Check and handle user profile
        const profileResult = await checkAndInitializeUser(user, autoInitializeUsers);
        
        if (profileResult.needsRedirect) {
            console.log('📝 Redirecting to complete profile...');
            clearTimeout(timeoutId);
            window.location.href = '/complete-profile.html';
            return;
        }
        
        userProfile = profileResult.userProfile;
        
        if (profileResult.isNewUser) {
            console.log('🎉 Welcome new user!');
            showToast(`Welcome to HustleHack AI, ${userProfile.name}!`, 'success');
        }
        
        // Load remaining dashboard data
        console.log('📊 Loading dashboard data...');
        await loadDashboardData();
        
        // Initialize UI
        console.log('🎨 Initializing UI...');
        initializeNavigation();
        initializeMobileMenu();
        initializeRealTimeFeatures();
        updateUserInterface();
        
        // Complete initialization
        clearTimeout(timeoutId);
        hideLoadingScreen();
        
        console.log('✅ Dashboard initialized successfully!');
        showToast('Dashboard loaded successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showToast('Failed to load dashboard. Please refresh the page.', 'error');
        hideLoadingScreen();
    }
}

// Helper function to load all dashboard data with error handling
async function loadDashboardData() {
    const dataPromises = [
        loadUsageStats().catch(err => {
            console.warn('⚠️ Usage stats load failed:', err);
            usageStats = { total: 0, recent: 0, byType: {}, logs: [] };
            return null;
        }),
        loadAvailableResources().catch(err => {
            console.warn('⚠️ Resources load failed:', err);
            availableResources = [];
            return null;
        }),
        loadRecentActivity().catch(err => {
            console.warn('⚠️ Activity load failed:', err);
            recentActivity = [];
            return null;
        })
    ];
    
    await Promise.all(dataPromises);
    console.log('✅ Dashboard data loaded');
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        autoInitializeNewUser,
        checkAndInitializeUser,
        initializeDashboardRobust,
        loadDashboardData
    };
}
