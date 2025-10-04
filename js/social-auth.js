// Social Authentication Module for West Coast Kutz
// Handles Google, Apple, and Microsoft OAuth sign-in

class SocialAuth {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleAuthCallback();
    }

    setupEventListeners() {
        // Google Sign-In
        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.signInWithGoogle());
        }

        // Apple Sign-In
        const appleBtn = document.getElementById('apple-signin');
        if (appleBtn) {
            appleBtn.addEventListener('click', () => this.signInWithApple());
        }

        // Microsoft Sign-In
        const microsoftBtn = document.getElementById('microsoft-signin');
        if (microsoftBtn) {
            microsoftBtn.addEventListener('click', () => this.signInWithMicrosoft());
        }

        // Sign Out
        const signOutBtn = document.getElementById('sign-out');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => this.signOut());
        }
    }

    async signInWithGoogle() {
        try {
            console.log('Initiating Google sign-in...');
            
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) {
                console.error('Google sign-in error:', error);
                this.showError('Failed to sign in with Google. Please try again.');
                return;
            }

            console.log('Google sign-in initiated successfully');
            
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        }
    }

    async signInWithApple() {
        try {
            console.log('Initiating Apple sign-in...');
            
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                console.error('Apple sign-in error:', error);
                this.showError('Failed to sign in with Apple. Please try again.');
                return;
            }

            console.log('Apple sign-in initiated successfully');
            
        } catch (error) {
            console.error('Apple sign-in error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        }
    }

    async signInWithMicrosoft() {
        try {
            console.log('Initiating Microsoft sign-in...');
            
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'azure',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    scopes: 'email profile'
                }
            });

            if (error) {
                console.error('Microsoft sign-in error:', error);
                this.showError('Failed to sign in with Microsoft. Please try again.');
                return;
            }

            console.log('Microsoft sign-in initiated successfully');
            
        } catch (error) {
            console.error('Microsoft sign-in error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                console.error('Sign out error:', error);
                this.showError('Failed to sign out. Please try again.');
                return;
            }

            console.log('User signed out successfully');
            this.updateUIForSignedOutUser();
            
        } catch (error) {
            console.error('Sign out error:', error);
            this.showError('An unexpected error occurred during sign out.');
        }
    }

    async handleAuthCallback() {
        // Check if we're on the callback page or if there's a session
        const { data: { session }, error } = await this.supabase.auth.getSession();
        
        if (error) {
            console.error('Session error:', error);
            return;
        }

        if (session) {
            console.log('User authenticated:', session.user);
            await this.handleAuthenticatedUser(session.user);
        }
    }

    async handleAuthenticatedUser(user) {
        try {
            // Check if user profile exists
            const { data: profile, error: profileError } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error checking user profile:', profileError);
                return;
            }

            // Create user profile if it doesn't exist
            if (!profile) {
                await this.createUserProfile(user);
            }

            // Update UI for authenticated user
            this.updateUIForAuthenticatedUser(user, profile);

            // If we're on the booking page, pre-fill user information
            this.prefillBookingForm(user, profile);

        } catch (error) {
            console.error('Error handling authenticated user:', error);
        }
    }

    async createUserProfile(user) {
        try {
            const profileData = {
                user_id: user.id,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                email: user.email,
                phone: user.user_metadata?.phone || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                provider: user.app_metadata?.provider || 'unknown',
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('user_profiles')
                .insert(profileData)
                .select()
                .single();

            if (error) {
                console.error('Error creating user profile:', error);
                return null;
            }

            console.log('User profile created:', data);
            return data;

        } catch (error) {
            console.error('Error creating user profile:', error);
            return null;
        }
    }

    updateUIForAuthenticatedUser(user, profile) {
        // Hide sign-in buttons
        const signInSection = document.getElementById('social-signin-section');
        if (signInSection) {
            signInSection.style.display = 'none';
        }

        // Show user info
        const userSection = document.getElementById('user-info-section');
        if (userSection) {
            userSection.style.display = 'block';
            
            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = profile?.full_name || user.email;
            }

            const userEmail = document.getElementById('user-email');
            if (userEmail) {
                userEmail.textContent = user.email;
            }

            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar && profile?.avatar_url) {
                userAvatar.src = profile.avatar_url;
            }
        }
    }

    updateUIForSignedOutUser() {
        // Show sign-in buttons
        const signInSection = document.getElementById('social-signin-section');
        if (signInSection) {
            signInSection.style.display = 'block';
        }

        // Hide user info
        const userSection = document.getElementById('user-info-section');
        if (userSection) {
            userSection.style.display = 'none';
        }

        // Clear any pre-filled form data
        this.clearBookingForm();
    }

    prefillBookingForm(user, profile) {
        // Pre-fill booking form if user is authenticated
        const nameField = document.getElementById('customer-name');
        const emailField = document.getElementById('customer-email');
        const phoneField = document.getElementById('customer-phone');

        if (nameField && profile?.full_name) {
            nameField.value = profile.full_name;
        }

        if (emailField && user.email) {
            emailField.value = user.email;
        }

        if (phoneField && profile?.phone) {
            phoneField.value = profile.phone;
        }
    }

    clearBookingForm() {
        const nameField = document.getElementById('customer-name');
        const emailField = document.getElementById('customer-email');
        const phoneField = document.getElementById('customer-phone');

        if (nameField) nameField.value = '';
        if (emailField) emailField.value = '';
        if (phoneField) phoneField.value = '';
    }

    showError(message) {
        // Show error message to user
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }

    // Get current user session
    async getCurrentUser() {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        return session?.user || null;
    }

    // Check if user is authenticated
    async isAuthenticated() {
        const user = await this.getCurrentUser();
        return !!user;
    }
}

// Export for use in other modules
window.SocialAuth = SocialAuth;
