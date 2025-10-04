// West Coast Kutz Admin Authentication System
// Secure admin authentication with role-based access control

class AdminAuth {
    constructor() {
        // Configuration will be loaded from environment or config
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.supabase = null;
        this.currentAdmin = null;
        this.isConfigured = false;
    }

    async init() {
        // Show auth check loading
        document.getElementById('auth-check').classList.remove('hidden');

        try {
            // Load configuration
            await this.loadConfiguration();

            if (!this.isConfigured) {
                this.showSetupMessage();
                return;
            }

            // Initialize Supabase client
            if (typeof supabase !== 'undefined') {
                this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);

                // Check for existing session
                const { data: { session } } = await this.supabase.auth.getSession();

                if (session) {
                    const isAdmin = await this.verifyAdminRole(session.user);
                    if (isAdmin) {
                        this.currentAdmin = session.user;
                        this.showAdminInterface();
                    } else {
                        this.showLoginModal();
                    }
                } else {
                    this.showLoginModal();
                }

                // Listen for auth changes
                this.supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event === 'SIGNED_IN') {
                        const isAdmin = await this.verifyAdminRole(session.user);
                        if (isAdmin) {
                            this.currentAdmin = session.user;
                            this.showAdminInterface();
                        } else {
                            await this.supabase.auth.signOut();
                            this.showError('Access denied. Admin privileges required.');
                        }
                    } else if (event === 'SIGNED_OUT') {
                        this.currentAdmin = null;
                        this.showLoginModal();
                    }
                });
            } else {
                throw new Error('Supabase client not loaded');
            }
        } catch (error) {
            console.error('Admin auth initialization error:', error);
            if (error.message.includes('Invalid supabaseUrl') || error.message.includes('supabaseUrl')) {
                this.showSetupMessage();
            } else {
                this.showError('Failed to initialize admin authentication: ' + error.message);
            }
        } finally {
            document.getElementById('auth-check').classList.add('hidden');
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

    showSetupMessage() {
        document.getElementById('auth-check').classList.add('hidden');
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('admin-interface').classList.add('hidden');

        // Create setup message
        const setupDiv = document.createElement('div');
        setupDiv.id = 'admin-setup-message';
        setupDiv.className = 'fixed inset-0 bg-gray-50 flex items-center justify-center z-50';
        setupDiv.innerHTML = `
            <div class="max-w-2xl mx-4 bg-white rounded-lg shadow-xl p-8">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-accentRed rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-feather="settings" class="w-8 h-8 text-white"></i>
                    </div>
                    <h2 class="font-heading text-2xl text-charcoal mb-2">Admin Dashboard Setup Required</h2>
                    <p class="text-gray-600">Configure your Supabase credentials to access the admin dashboard</p>
                </div>

                <div class="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 class="font-medium text-charcoal mb-3">Setup Instructions:</h3>
                    <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" class="text-accentRed hover:underline">supabase.com</a></li>
                        <li>Copy your project URL and anon key from the Supabase dashboard</li>
                        <li>Add the configuration using one of these methods:</li>
                    </ol>
                </div>

                <div class="space-y-4">
                    <div class="border border-gray-200 rounded-lg p-4">
                        <h4 class="font-medium text-charcoal mb-2">Option 1: Quick Setup (Recommended for Testing)</h4>
                        <p class="text-sm text-gray-600 mb-3">Add this script tag to the &lt;head&gt; section of admin/index.html:</p>
                        <pre class="bg-gray-100 p-3 rounded text-xs overflow-x-auto"><code>&lt;script&gt;
window.SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
&lt;/script&gt;</code></pre>
                    </div>

                    <div class="border border-gray-200 rounded-lg p-4">
                        <h4 class="font-medium text-charcoal mb-2">Option 2: Environment Variables (Production)</h4>
                        <p class="text-sm text-gray-600 mb-3">Set these environment variables in your deployment:</p>
                        <pre class="bg-gray-100 p-3 rounded text-xs overflow-x-auto"><code>SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key</code></pre>
                    </div>
                </div>

                <div class="flex justify-center mt-6">
                    <button onclick="location.reload()" class="bg-accentRed hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition">
                        Refresh After Setup
                    </button>
                </div>

                <div class="text-center mt-4">
                    <a href="/" class="text-sm text-gray-600 hover:text-gray-800">← Back to Main Site</a>
                </div>
            </div>
        `;

        document.body.appendChild(setupDiv);

        // Re-render feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    async verifyAdminRole(user) {
        if (!user) return false;

        try {
            const { data: profile, error } = await this.supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error verifying admin role:', error);
                return false;
            }

            return profile && profile.role === 'admin';
        } catch (error) {
            console.error('Error verifying admin role:', error);
            return false;
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

            // Role verification will happen in the auth state change listener
            return { success: true, data };
        } catch (error) {
            console.error('Admin sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        if (!this.isConfigured || !this.supabase) {
            return { success: false, error: 'Authentication not configured.' };
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Admin sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    showLoginModal() {
        document.getElementById('admin-login-modal').classList.remove('hidden');
        document.getElementById('admin-interface').classList.add('hidden');
        this.clearError();
    }

    showAdminInterface() {
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('admin-interface').classList.remove('hidden');
        
        // Update admin user info
        const userInfo = document.getElementById('admin-user-info');
        if (userInfo && this.currentAdmin) {
            userInfo.textContent = `Logged in as: ${this.currentAdmin.email}`;
        }

        // Load dashboard data
        if (typeof adminDashboard !== 'undefined') {
            adminDashboard.loadDashboardData();
        }
    }

    showError(message) {
        const errorElement = document.getElementById('admin-login-error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearError() {
        const errorElement = document.getElementById('admin-login-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    isLoggedIn() {
        return !!this.currentAdmin;
    }

    getCurrentAdmin() {
        return this.currentAdmin;
    }

    // Helper method to make authenticated API calls
    async makeAuthenticatedRequest(endpoint, options = {}) {
        if (!this.isLoggedIn()) {
            throw new Error('Not authenticated');
        }

        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session) {
            throw new Error('No valid session');
        }

        const headers = {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        return fetch(endpoint, {
            ...options,
            headers
        });
    }

    // Database helper methods for admin operations
    async getServices() {
        try {
            const { data, error } = await this.supabase
                .from('services')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching services:', error);
            return { success: false, error: error.message };
        }
    }

    async getBarbers() {
        try {
            const { data, error } = await this.supabase
                .from('barbers')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching barbers:', error);
            return { success: false, error: error.message };
        }
    }

    async getAppointments(filters = {}) {
        try {
            let query = this.supabase
                .from('appointments')
                .select(`
                    id,
                    user_id,
                    barber_id,
                    service_id,
                    customer_name,
                    customer_phone,
                    customer_email,
                    appointment_date,
                    appointment_time,
                    duration_minutes,
                    price_dollars,
                    status,
                    payment_status,
                    payment_intent_id,
                    notes,
                    sms_sent,
                    created_at,
                    updated_at,
                    services(name, duration_minutes, price_dollars),
                    barbers(name, nickname)
                `)
                .order('appointment_date', { ascending: true });

            // Apply filters
            if (filters.date) {
                query = query.eq('appointment_date', filters.date);
            }
            if (filters.barber_id) {
                query = query.eq('barber_id', filters.barber_id);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return { success: false, error: error.message };
        }
    }

    async getCustomers() {
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('role', 'customer')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching customers:', error);
            return { success: false, error: error.message };
        }
    }

    async getGalleryImages() {
        try {
            const { data, error } = await this.supabase
                .from('gallery_images')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            return { success: false, error: error.message };
        }
    }

    async getHeroImages() {
        try {
            const { data, error } = await this.supabase
                .from('hero_images')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching hero images:', error);
            return { success: false, error: error.message };
        }
    }

    // Statistics methods
    async getDashboardStats() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

            // Get today's appointments
            const { data: todayAppointments } = await this.supabase
                .from('appointments')
                .select('id')
                .eq('appointment_date', today)
                .neq('status', 'cancelled');

            // Get total customers
            const { data: customers } = await this.supabase
                .from('user_profiles')
                .select('id')
                .eq('role', 'customer');

            // Get this month's revenue
            const { data: monthlyAppointments } = await this.supabase
                .from('appointments')
                .select('price_dollars')
                .gte('appointment_date', startOfMonth)
                .eq('status', 'confirmed');

            // Get pending appointments
            const { data: pendingAppointments } = await this.supabase
                .from('appointments')
                .select('id')
                .eq('status', 'pending');

            const monthlyRevenue = monthlyAppointments?.reduce((sum, apt) => sum + (apt.price_dollars || 0), 0) || 0;

            return {
                success: true,
                data: {
                    todayAppointments: todayAppointments?.length || 0,
                    totalCustomers: customers?.length || 0,
                    monthlyRevenue: monthlyRevenue, // Already in dollars
                    pendingAppointments: pendingAppointments?.length || 0
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return { success: false, error: error.message };
        }
    }
}

// Global admin auth instance
const adminAuth = new AdminAuth();

// Admin login form handler
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    adminAuth.clearError();
    
    const result = await adminAuth.signIn(email, password);
    
    if (!result.success) {
        adminAuth.showError(result.error);
    }
    // Success handling is done in the auth state change listener
}
