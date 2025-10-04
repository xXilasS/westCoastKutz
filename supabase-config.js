// Supabase Configuration for West Coast Kutz
// Replace the placeholder values with your actual Supabase credentials

const SUPABASE_CONFIG = {
    // Get these from your Supabase Dashboard > Settings > API
    url: 'https://mktvcfzlojebtuwnehej.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdHZjZnpsb2plYnR1d25laGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDkyMzIsImV4cCI6MjA3NTAyNTIzMn0.RPat9Gv4vxBVP-EBOuyAe6KuPXGMma1jI9RX3I8sYq0',
};

// Initialize Supabase client
let supabase = null;

try {
    if (typeof window !== 'undefined' && window.supabase) {
        if (SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
            supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('Supabase client initialized successfully');
        } else {
            console.warn('Supabase credentials not configured. Please update supabase-config.js');
        }
    }
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, supabase };
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.supabaseClient = supabase;
}

// Instructions for setup:
/*
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your West Coast Kutz project
3. Go to Settings > API
4. Copy your Project URL and replace 'YOUR_SUPABASE_URL'
5. Copy your anon/public key and replace 'YOUR_SUPABASE_ANON_KEY'
6. Save this file

Example:
const SUPABASE_CONFIG = {
    url: 'https://abcdefghijklmnop.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
*/
