// HustleHack AI - Advanced JavaScript Functionality

// DOM Elements
const navbar = document.querySelector('.navbar');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const modals = document.querySelectorAll('.modal');
const modalTriggers = document.querySelectorAll('[data-modal]');
const modalCloses = document.querySelectorAll('.modal-close');

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeModals();
  initializeAnimations();
  initializeForms();
  initializeScrollEffects();
  initializeLoadingStates();
  initializeAuthSystem(); // Updated to handle both signup and login
  addRealTimeValidation(); // Already exists
});


// Navigation Functions
function initializeNavigation() {
    // Mobile menu toggle
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Navbar scroll effects
    window.addEventListener('scroll', handleNavbarScroll);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Ignore links whose href is just "#" (or "#!")
        if (!href || href === '#' || href === '#!') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - 80;   // compensate for fixed navbar
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    mobileMenuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    
    // Add nav-actions to mobile menu when active
    if (navMenu.classList.contains('active')) {
        const navActions = document.querySelector('.nav-actions');
        if (navActions && !navMenu.contains(navActions)) {
            const navActionsClone = navActions.cloneNode(true);
            navActionsClone.style.display = 'flex';
            navMenu.appendChild(navActionsClone);
        }
    }
}

function closeMobileMenu() {
    navMenu.classList.remove('active');
    mobileMenuToggle.textContent = '☰';
    
    // Remove cloned nav-actions from mobile menu
    const clonedNavActions = navMenu.querySelector('.nav-actions');
    if (clonedNavActions) {
        clonedNavActions.remove();
    }
}

function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Modal Functions
function initializeModals() {
    // Modal triggers
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                openModal(modal);
            }
        });
    });

    // Modal close buttons
    modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input in modal
    const firstInput = modal.querySelector('input, textarea, select');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Animation Functions
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.card, .section, .pricing-card').forEach(el => {
        observer.observe(el);
    });

    // Typing animation for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        typeWriter(heroTitle, heroTitle.textContent, 50);
    }
}

function typeWriter(element, text, speed = 100) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    // Start typing after a delay
    setTimeout(type, 1000);
}

// Form Functions
function initializeForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Skip auth forms as they have their own handlers
        if (form.id === 'loginForm' || form.id === 'signupForm') {
            return;
        }
        
        form.addEventListener('submit', handleFormSubmit);
        
        // Input validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading state
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        // Simulate form submission
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            
            // Show success message
            showNotification('Form submitted successfully!', 'success');
            
            // Close modal if form is in modal
            const modal = form.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
            
            // Reset form
            form.reset();
        }, 2000);
    }
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    // Remove existing error
    clearValidationError(e);
    
    // Validation rules
    if (input.required && !value) {
        showInputError(input, 'This field is required');
        return false;
    }
    
    if (input.type === 'email' && value && !isValidEmail(value)) {
        showInputError(input, 'Please enter a valid email address');
        return false;
    }
    
    if (input.type === 'password' && value && value.length < 6) {
        showInputError(input, 'Password must be at least 6 characters');
        return false;
    }
    
    return true;
}

function clearValidationError(e) {
    const input = e.target;
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
    input.classList.remove('error');
}

function showInputError(input, message) {
    input.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ff4444';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    
    input.parentNode.appendChild(errorElement);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styling
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontWeight: '500',
        zIndex: '3000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out'
    });
    
    // Type-specific styling
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Scroll Effects
function initializeScrollEffects() {
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    Object.assign(progressBar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '0%',
        height: '3px',
        background: 'linear-gradient(135deg, #7F5AF0, #00FFC2)',
        zIndex: '1001',
        transition: 'width 0.1s ease'
    });
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = `${scrolled}%`;
    });
}

// Loading States
function initializeLoadingStates() {
    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('btn-loading')) return;
            
            this.classList.add('btn-loading');
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            
            setTimeout(() => {
                this.classList.remove('btn-loading');
                this.textContent = originalText;
            }, 1000);
        });
    });
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// FAQ Toggle Function
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('.faq-icon');
    
    if (answer.style.display === 'none' || !answer.style.display) {
        answer.style.display = 'block';
        answer.style.maxHeight = answer.scrollHeight + 'px';
        if (icon) icon.textContent = '−';
    } else {
        answer.style.display = 'none';
        answer.style.maxHeight = '0px';
        if (icon) icon.textContent = '+';
    }
}

// Dark/Light Mode Toggle (if needed)
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle button text
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Load saved theme
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Authentication System Initialization
function initializeAuthSystem() {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if user is already logged in
    checkAuthStatus();
}

// Check authentication status on page load
async function checkAuthStatus() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth check error:', error);
            return;
        }
        
        if (session && session.user) {
            console.log('User is authenticated:', session.user.email);
            updateUIForAuthenticatedUser(session.user);
        } else {
            console.log('User is not authenticated');
            updateUIForUnauthenticatedUser();
        }
    } catch (error) {
        console.error('Auth status check failed:', error);
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
    // Update Sign In button
    const signInBtn = document.querySelector('[data-modal="login-modal"]');
    if (signInBtn) {
        const userName = user.user_metadata?.name || user.email.split('@')[0];
        signInBtn.textContent = `👋 ${userName}`;
        signInBtn.removeAttribute('data-modal');
        signInBtn.classList.add('user-menu');
        signInBtn.addEventListener('click', handleSignOut);
    }
    
    // Update Get Started button
    const getStartedBtn = document.querySelector('[data-modal="signup-modal"]');
    if (getStartedBtn) {
        getStartedBtn.textContent = '🎯 Dashboard';
        getStartedBtn.removeAttribute('data-modal');
        getStartedBtn.href = '#dashboard';
        getStartedBtn.classList.add('dashboard-btn');
    }
    
    // Update all other signup buttons
    const allSignupBtns = document.querySelectorAll('[data-modal="signup-modal"]');
    allSignupBtns.forEach(btn => {
        if (btn !== getStartedBtn) {
            btn.textContent = '✨ Dashboard';
            btn.removeAttribute('data-modal');
            btn.href = '#dashboard';
        }
    });
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
    // Reset Sign In button
    const signInBtn = document.querySelector('.user-menu') || document.querySelector('a[href="#"]');
    if (signInBtn && signInBtn.textContent.includes('👋')) {
        signInBtn.textContent = 'Sign In';
        signInBtn.setAttribute('data-modal', 'login-modal');
        signInBtn.classList.remove('user-menu');
        signInBtn.removeEventListener('click', handleSignOut);
    }
    
    // Reset Get Started button
    const getStartedBtn = document.querySelector('.dashboard-btn');
    if (getStartedBtn) {
        getStartedBtn.textContent = 'Get Started';
        getStartedBtn.setAttribute('data-modal', 'signup-modal');
        getStartedBtn.classList.remove('dashboard-btn');
        getStartedBtn.removeAttribute('href');
    }
    
    // Reset all other buttons
    const allDashboardBtns = document.querySelectorAll('a[href="#dashboard"]');
    allDashboardBtns.forEach(btn => {
        if (btn.textContent.includes('Dashboard')) {
            btn.textContent = 'Get Started';
            btn.setAttribute('data-modal', 'signup-modal');
            btn.removeAttribute('href');
        }
    });
}

// Handle user sign out
async function handleSignOut(e) {
    e.preventDefault();
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            showNotification('❌ Sign out failed', 'error');
            return;
        }
        
        showNotification('✅ Signed out successfully', 'success');
        updateUIForUnauthenticatedUser();
        
        // Refresh the page to reset everything
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Sign out error:', error);
        showNotification('❌ Sign out failed', 'error');
    }
}

// Handle user login
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login function called');
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Button loading state
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Signing In...';
    loginBtn.disabled = true;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            // Handle specific error cases
            if (error.message.includes('Invalid login credentials')) {
                showNotification('❌ Invalid email or password. Please try again.', 'error');
            } else if (error.message.includes('Email not confirmed')) {
                showNotification('📧 Please check your email and confirm your account first.', 'warning');
            } else {
                showNotification(`❌ ${error.message}`, 'error');
            }
            return;
        }
        
        const user = data?.user;
        if (!user) {
            showNotification('❌ Login failed. Please try again.', 'error');
            return;
        }
        
        // Fetch user profile data from database
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profileError) {
            console.warn('Could not fetch user profile:', profileError);
        }
        
        // Success!
        const userName = userProfile?.name || user.user_metadata?.name || user.email.split('@')[0];
        showNotification(`🎉 Welcome back, ${userName}!`, 'success');
        
        // Update UI
        updateUIForAuthenticatedUser(user);
        
        // Reset form and close modal
        document.getElementById('loginForm').reset();
        closeModal(document.getElementById('login-modal'));
        
        // Success follow-up
        setTimeout(() => {
            showNotification('✨ You are now signed in and ready to explore!', 'success');
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('❌ An unexpected error occurred during login.', 'error');
    } finally {
        // Reset button state
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    console.log('🧠 Signup function called');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    const device = navigator.userAgent;
    const timestamp = new Date().toISOString();

    // Validate inputs
    if (!name || !email || !password || !role) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    // Button loading state
    const signupBtn = document.getElementById('signupBtn');
    const btnText = signupBtn.querySelector('.btn-text');
    const btnLoading = signupBtn.querySelector('.btn-loading');
    signupBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';

    try {
        // Step 1: Sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, role, device, timestamp }
            }
        });

        if (signUpError) {
            // Handle specific signup errors
            if (signUpError.message.includes('User already registered')) {
                showNotification('⚠️ This email is already registered. Please sign in instead.', 'warning');
                
                // Auto-switch to login modal
                setTimeout(() => {
                    closeModal(document.getElementById('signup-modal'));
                    openModal(document.getElementById('login-modal'));
                    document.getElementById('loginEmail').value = email;
                }, 2000);
            } else {
                showNotification(`❌ ${signUpError.message}`, 'error');
            }
            return;
        }

        // Step 2: Wait for session (for RLS insert)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        console.log("👤 Session user ID:", user?.id);

        if (!user || sessionError) {
            showNotification("⚠️ Signup succeeded, but login session not ready. Check your email.", 'warning');
            console.error("Session Error:", sessionError);
            return;
        }

        // Step 3: Insert user into 'users' table
        const { error: dbError } = await supabase.from('users').insert([
            {
                id: user.id,
                name,
                role,
                device,
                timestamp
            }
        ]);

        if (dbError) {
            showNotification('⚠️ Account created, but profile setup incomplete.', 'warning');
            console.error('DB Error:', dbError);
        } else {
            showNotification('🎉 Account created successfully!', 'success');
        }

        // Cleanup
        document.getElementById('signupForm').reset();
        closeModal(document.getElementById('signup-modal'));

        // Professional success flow
        setTimeout(() => {
            showNotification('📧 Please check your email to verify your account.', 'info');
        }, 1500);
        
        setTimeout(() => {
            showNotification('✨ Welcome to HustleHack AI! We\'re excited to have you onboard.', 'success');
        }, 3000);
    } catch (err) {
        console.error('Signup Error:', err);
        showNotification('❌ An unexpected error occurred.', 'error');
    } finally {
        signupBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
    }
}



// Enhanced Form Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Add real-time validation
function addRealTimeValidation() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showInputError(this, 'Name is required');
            } else {
                clearInputError(this);
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showInputError(this, 'Email is required');
            } else if (!validateEmail(this.value)) {
                showInputError(this, 'Please enter a valid email address');
            } else {
                clearInputError(this);
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showInputError(this, 'Password is required');
            } else if (!validatePassword(this.value)) {
                showInputError(this, 'Password must be at least 6 characters long');
            } else {
                clearInputError(this);
            }
        });
    }
}

function showInputError(input, message) {
    clearInputError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#EF4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    input.parentNode.appendChild(errorDiv);
    input.style.borderColor = '#EF4444';
}

function clearInputError(input) {
    const errorDiv = input.parentNode.querySelector('.input-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    input.style.borderColor = '';
}


// Modal switching functions
function switchToSignup() {
    closeModal(document.getElementById('login-modal'));
    setTimeout(() => {
        openModal(document.getElementById('signup-modal'));
    }, 300);
}

function switchToLogin() {
    closeModal(document.getElementById('signup-modal'));
    setTimeout(() => {
        openModal(document.getElementById('login-modal'));
    }, 300);
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN') {
        updateUIForAuthenticatedUser(session.user);
    } else if (event === 'SIGNED_OUT') {
        updateUIForUnauthenticatedUser();
    }
});

// Export functions for global use
window.toggleFAQ = toggleFAQ;
window.toggleTheme = toggleTheme;
window.showNotification = showNotification;
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
