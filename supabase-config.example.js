// West Coast Kutz - Supabase Configuration Example
// Copy this file and add it to the <head> section of your HTML files

// INSTRUCTIONS:
// 1. Create a Supabase project at https://supabase.com
// 2. Get your Project URL and anon key from Settings > API
// 3. Replace the placeholder values below with your actual credentials
// 4. Add this script tag to the <head> section of index.html and admin/index.html

/*
<script>
window.SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key-here'
};
</script>
*/

// EXAMPLE (replace with your actual values):
/*
<script>
window.SUPABASE_CONFIG = {
    url: 'https://abcdefghijklmnop.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-signature-here'
};
</script>
*/

// SECURITY NOTES:
// - Only use the 'anon' key in client-side code (never the service_role key)
// - The anon key is safe to expose in client-side code
// - For production, consider using environment variables instead

// WHERE TO ADD:
// Add the script tag to the <head> section of:
// - index.html (for customer authentication)
// - admin/index.html (for admin authentication)

// ALTERNATIVE: Environment Variables
// For production deployments, you can use environment variables instead:
// SUPABASE_URL=https://your-project-id.supabase.co
// SUPABASE_ANON_KEY=your-anon-key-here
// SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
