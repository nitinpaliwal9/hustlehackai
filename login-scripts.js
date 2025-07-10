// Login Script - HustleHack AI
// Google Sign-In and Email Authentication

// DOM Elements
const googleLoginBtn = document.getElementById('google-login-btn');
const emailForm = document.getElementById('email-login-form');
const messageToast = document.getElementById('message-toast');

// Utility Functions
function showToast(message, type = 'success') {
    const toast = messageToast;
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.textContent = '✅';
        toast.className = 'toast success';
    } else if (type === 'error') {
        toastIcon.textContent = '❌';
        toast.className = 'toast error';
    } else if (type === 'info') {
        toastIcon.textContent = 'ℹ️';
        toast.className = 'toast info';
    }
    
    // Show toast
    toast.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('span:not(.btn-loading)');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (isLoading) {
        button.classList.add('loading');
        if (btnText) btnText.style.opacity = '0';
        if (btnLoading) btnLoading.style.display = 'flex';
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        if (btnText) btnText.style.opacity = '1';
        if (btnLoading) btnLoading.style.display = 'none';
        button.disabled = false;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Save user data to database
async function saveUserToDatabase(user) {
    try {
        console.log('💾 Saving user to database:', user.id);
        
        // Check if user already exists
        const { data: existingUser } = await window.supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!existingUser) {
            // Create new user record
            const { data, error } = await window.supabase
                .from('users')
                .insert([{
                    id: user.id,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    role: user.app_metadata?.provider === 'google' ? 'Google User' : 'Email User',
                    device: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    provider: user.app_metadata?.provider || 'email'
                }]);

            if (error) {
                console.error('❌ Error saving user:', error);
                return false;
            }
            
            console.log('✅ User saved successfully:', data);
        } else {
            console.log('✅ User already exists in database');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error in saveUserToDatabase:', error);
        return false;
    }
}

// Check if user is already logged in
async function checkAuthState() {
    try {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Auth state error:', error);
            return;
        }
        
        if (session && session.user) {
            console.log('✅ User already logged in:', session.user.email);
            // Redirect to dashboard or main page
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('❌ Error checking auth state:', error);
    }
}

// Google Sign-In Handler
async function handleGoogleLogin() {
    try {
        console.log('🔑 Starting Google login...');
        setButtonLoading(googleLoginBtn, true);
        
        const { data, error } = await window.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback.html`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });

        if (error) {
            console.error('❌ Google login error:', error);
            showToast('Failed to start Google login. Please try again.', 'error');
            setButtonLoading(googleLoginBtn, false);
            return;
        }
        
        console.log('✅ Google OAuth flow started...');
        // Note: User will be redirected to Google, so we don't need to reset button state
        
    } catch (error) {
        console.error('❌ Google login error:', error);
        showToast('An error occurred during Google login.', 'error');
        setButtonLoading(googleLoginBtn, false);
    }
}

// Email Sign-In Handler
async function handleEmailLogin(email, password) {
    try {
        console.log('📧 Starting email login for:', email);
        
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return false;
        }
        
        if (!validatePassword(password)) {
            showToast('Password must be at least 6 characters long.', 'error');
            return false;
        }
        
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('❌ Email login error:', error);
            
            if (error.message.includes('Invalid login credentials')) {
                showToast('Invalid email or password. Please check your credentials.', 'error');
            } else if (error.message.includes('Email not confirmed')) {
                showToast('Please check your email and confirm your account first.', 'error');
            } else {
                showToast('Login failed. Please try again.', 'error');
            }
            return false;
        }

        if (data.user) {
            console.log('✅ Email login successful:', data.user.email);
            
            // Save user to database
            await saveUserToDatabase(data.user);
            
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
            
            return true;
        }
        
    } catch (error) {
        console.error('❌ Email login error:', error);
        showToast('An error occurred during login. Please try again.', 'error');
        return false;
    }
}

// Password visibility toggle
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// Switch to signup (for future implementation)
function switchToSignup() {
    // For now, redirect to signup modal or page
    const signupModal = document.getElementById('signup-modal');
    const loginModal = document.getElementById('login-modal');
    
    if (signupModal && loginModal) {
        loginModal.classList.remove('active');
        signupModal.classList.add('active');
    } else {
        // Redirect to index page and trigger signup modal
        window.location.href = '/index.html?signup=true';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Login page loaded');
    
    // Check if user is already authenticated
    checkAuthState();
    
    // Google login button
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Email login form
    if (emailForm) {
        emailForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loginBtn = emailForm.querySelector('.login-btn');
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            setButtonLoading(loginBtn, true);
            
            const success = await handleEmailLogin(email, password);
            
            if (!success) {
                setButtonLoading(loginBtn, false);
            }
            // If success, page will redirect, so no need to reset button
        });
    }
    
    // Add input focus effects
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Auto-focus first input
    const firstInput = document.querySelector('.form-input');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 500);
    }
});

// Listen for auth state changes
window.supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.email);
        
        // Save user to database
        saveUserToDatabase(session.user);
        
        // Show success message
        showToast('Login successful! Welcome back!', 'success');
        
        // Redirect to main page
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
    }
    
    if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter key to submit form when focused on inputs
    if (e.key === 'Enter' && document.activeElement.classList.contains('form-input')) {
        const form = document.activeElement.closest('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape key to close toast
    if (e.key === 'Escape' && messageToast.style.display === 'block') {
        messageToast.style.display = 'none';
    }
});

// Close toast when clicked
if (messageToast) {
    messageToast.addEventListener('click', function() {
        this.style.display = 'none';
    });
}

// Handle URL parameters
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('message')) {
    const message = urlParams.get('message');
    const type = urlParams.get('type') || 'info';
    showToast(decodeURIComponent(message), type);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Export functions for global access
window.togglePasswordVisibility = togglePasswordVisibility;
window.switchToSignup = switchToSignup;
