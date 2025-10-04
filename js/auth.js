// West Coast Kutz Authentication System
// Customer login/registration functionality

class AuthSystem {
    constructor() {
        // Configuration will be loaded from environment or config
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.supabase = null;
        this.currentUser = null;
        this.isConfigured = false;

        this.init();
    }

    async init() {
        try {
            // Load configuration
            await this.loadConfiguration();

            if (!this.isConfigured) {
                console.log('Supabase not configured. Authentication features will be disabled.');
                this.updateUIForLoggedOutUser();
                return;
            }

            // Initialize Supabase client
            if (typeof supabase !== 'undefined') {
                this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);

                // Check for existing session
                const { data: { session } } = await this.supabase.auth.getSession();
                if (session) {
                    this.currentUser = session.user;
                    await this.loadUserProfile();
                    this.updateUIForLoggedInUser();
                } else {
                    this.updateUIForLoggedOutUser();
                }

                // Listen for auth changes
                this.supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN') {
                        this.currentUser = session.user;
                        this.loadUserProfile();
                        this.updateUIForLoggedInUser();
                    } else if (event === 'SIGNED_OUT') {
                        this.currentUser = null;
                        this.updateUIForLoggedOutUser();
                    }
                });
            } else {
                console.log('Supabase client not loaded. Authentication features will be disabled.');
                this.updateUIForLoggedOutUser();
            }
        } catch (error) {
            console.error('Auth system initialization error:', error);
            this.updateUIForLoggedOutUser();
        }
    }

    async loadConfiguration() {
        // Try to load from window.SUPABASE_CONFIG first (for easy setup)
        if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
            this.supabaseUrl = window.SUPABASE_CONFIG.url;
            this.supabaseKey = window.SUPABASE_CONFIG.anonKey;
            this.isConfigured = true;
            return;
        }

        // Try to load from environment variables (for production)
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const config = await response.json();
                if (config.supabaseUrl && config.supabaseKey) {
                    this.supabaseUrl = config.supabaseUrl;
                    this.supabaseKey = config.supabaseKey;
                    this.isConfigured = true;
                    return;
                }
            }
        } catch (error) {
            console.log('No config endpoint available, using manual configuration');
        }

        // Check for hardcoded values (fallback)
        const hardcodedUrl = 'YOUR_SUPABASE_URL';
        const hardcodedKey = 'YOUR_SUPABASE_ANON_KEY';

        if (hardcodedUrl !== 'YOUR_SUPABASE_URL' && hardcodedKey !== 'YOUR_SUPABASE_ANON_KEY') {
            this.supabaseUrl = hardcodedUrl;
            this.supabaseKey = hardcodedKey;
            this.isConfigured = true;
        }
    }

    async loadUserProfile() {
        if (!this.currentUser) return;

        try {
            const { data: profile, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create it
                await this.createUserProfile();
            } else if (profile) {
                this.currentUser.profile = profile;
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async createUserProfile() {
        if (!this.currentUser) return;

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .insert({
                    id: this.currentUser.id,
                    email: this.currentUser.email,
                    full_name: this.currentUser.user_metadata?.full_name || '',
                    phone: this.currentUser.user_metadata?.phone || '',
                    role: 'customer'
                })
                .select()
                .single();

            if (data) {
                this.currentUser.profile = data;
            }
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    async signUp(email, password, fullName, phone) {
        if (!this.isConfigured || !this.supabase) {
            return { success: false, error: 'Authentication not configured. Please set up Supabase credentials.' };
        }

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    }
                }
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        if (!this.isConfigured || !this.supabase) {
            return { success: false, error: 'Authentication not configured. Please set up Supabase credentials.' };
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        if (!this.isConfigured || !this.supabase) {
            alert('Authentication not configured.');
            return { success: false, error: 'Authentication not configured.' };
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            // Clear current user data
            this.currentUser = null;

            // Update UI immediately
            this.updateUIForLoggedOutUser();

            // Close any open modals
            closeAuthModal();
            closeAccountModal();

            // Show success message
            showMessage('Successfully signed out!', 'success');

            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            alert('Error signing out: ' + error.message);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        if (!this.isConfigured || !this.supabase) {
            return { success: false, error: 'Authentication not configured. Please set up Supabase credentials.' };
        }

        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProfile(updates) {
        if (!this.currentUser) return { success: false, error: 'Not authenticated' };
        if (!this.isConfigured || !this.supabase) {
            return { success: false, error: 'Authentication not configured. Please set up Supabase credentials.' };
        }

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;

            this.currentUser.profile = data;
            return { success: true, data };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserAppointments() {
        if (!this.currentUser) return { success: false, error: 'Not authenticated' };

        try {
            const { data, error } = await this.supabase
                .from('appointments')
                .select(`
                    *,
                    services(name, duration_minutes),
                    barbers(name, nickname)
                `)
                .or(`user_id.eq.${this.currentUser.id},customer_email.eq.${this.currentUser.email}`)
                .order('appointment_date', { ascending: true });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return { success: false, error: error.message };
        }
    }

    async cancelAppointment(appointmentId) {
        if (!this.currentUser) return { success: false, error: 'Not authenticated' };

        try {
            const { data, error } = await this.supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', appointmentId)
                .or(`user_id.eq.${this.currentUser.id},customer_email.eq.${this.currentUser.email}`)
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            return { success: false, error: error.message };
        }
    }

    updateUIForLoggedInUser() {
        // Update navigation to show account link
        const authButtons = document.getElementById('auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="flex items-center space-x-4">
                    <span class="text-white text-sm">Welcome, ${this.currentUser.profile?.full_name || this.currentUser.email}</span>
                    <button onclick="openAccountModal()" class="text-white hover:text-accentGold transition">My Account</button>
                    <button onclick="authSystem.signOut()" class="text-white hover:text-accentGold transition">Sign Out</button>
                </div>
            `;
        }

        // Update mobile menu
        const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
        if (mobileAuthButtons) {
            mobileAuthButtons.innerHTML = `
                <button onclick="openAccountModal()" class="block px-3 py-2 text-white hover:bg-silver/10 rounded-md">My Account</button>
                <button onclick="authSystem.signOut()" class="block px-3 py-2 text-white hover:bg-silver/10 rounded-md">Sign Out</button>
            `;
        }
    }

    updateUIForLoggedOutUser() {
        // Update navigation to show login/register or setup message
        const authButtons = document.getElementById('auth-buttons');
        if (authButtons) {
            if (this.isConfigured) {
                authButtons.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <button onclick="openAuthModal('login')" class="text-white hover:text-accentGold transition">Sign In</button>
                        <button onclick="openAuthModal('register')" class="bg-accentGold hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium transition">Sign Up</button>
                    </div>
                `;
            } else {
                authButtons.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <span class="text-white text-sm opacity-75">Auth Setup Required</span>
                    </div>
                `;
            }
        }

        // Update mobile menu
        const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
        if (mobileAuthButtons) {
            if (this.isConfigured) {
                mobileAuthButtons.innerHTML = `
                    <button onclick="openAuthModal('login')" class="block px-3 py-2 text-white hover:bg-silver/10 rounded-md">Sign In</button>
                    <button onclick="openAuthModal('register')" class="block px-3 py-2 text-white hover:bg-silver/10 rounded-md">Sign Up</button>
                `;
            } else {
                mobileAuthButtons.innerHTML = `
                    <span class="block px-3 py-2 text-white opacity-75 text-sm">Auth Setup Required</span>
                `;
            }
        }
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserProfile() {
        return this.currentUser?.profile;
    }
}

// Global auth system instance
let authSystem = null;

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
});

// Auth modal functions
function openAuthModal(mode = 'login') {
    // Check if authentication is configured
    if (!authSystem || !authSystem.isConfigured) {
        alert('Authentication is not configured yet. Please set up Supabase credentials to enable user accounts.');
        return;
    }

    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Switch between login and register forms
        showAuthForm(mode);
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Clear forms
        document.getElementById('auth-login-form')?.reset();
        document.getElementById('auth-register-form')?.reset();
        clearAuthErrors();
    }
}

function showAuthForm(mode) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const loginTab = document.getElementById('auth-login-tab');
    const registerTab = document.getElementById('auth-register-tab');

    if (mode === 'login') {
        loginForm?.classList.remove('hidden');
        registerForm?.classList.add('hidden');
        loginTab?.classList.add('active');
        registerTab?.classList.remove('active');
    } else {
        loginForm?.classList.add('hidden');
        registerForm?.classList.remove('hidden');
        loginTab?.classList.remove('active');
        registerTab?.classList.add('active');
    }
    
    clearAuthErrors();
}

function clearAuthErrors() {
    const errorElements = document.querySelectorAll('.auth-error');
    errorElements.forEach(el => el.textContent = '');
}

function showAuthError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Auth form handlers
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    clearAuthErrors();
    
    const result = await authSystem.signIn(email, password);
    
    if (result.success) {
        closeAuthModal();
    } else {
        showAuthError('login-error', result.error);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const fullName = formData.get('fullName');
    const phone = formData.get('phone');
    
    clearAuthErrors();
    
    if (password !== confirmPassword) {
        showAuthError('register-error', 'Passwords do not match');
        return;
    }
    
    const result = await authSystem.signUp(email, password, fullName, phone);
    
    if (result.success) {
        showAuthError('register-error', 'Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
            closeAuthModal();
        }, 2000);
    } else {
        showAuthError('register-error', result.error);
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('login-email')?.value;
    
    if (!email) {
        showAuthError('login-error', 'Please enter your email address');
        return;
    }
    
    const result = await authSystem.resetPassword(email);
    
    if (result.success) {
        showAuthError('login-error', 'Password reset email sent! Check your inbox.');
    } else {
        showAuthError('login-error', result.error);
    }
}

// Additional helper functions
function closeAccountModal() {
    const modal = document.getElementById('account-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function showMessage(message, type = 'info') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// Initialize auth system when page loads
document.addEventListener('DOMContentLoaded', () => {
    authSystem.init();
});
