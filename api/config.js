// West Coast Kutz - Configuration API
// Provides client-side configuration from environment variables

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Only return public configuration (never expose service role keys)
        const config = {
            supabaseUrl: process.env.SUPABASE_URL || null,
            supabaseKey: process.env.SUPABASE_ANON_KEY || null,
            // Add other public configuration as needed
            environment: process.env.NODE_ENV || 'development'
        };

        // Only return config if both URL and key are available
        if (config.supabaseUrl && config.supabaseKey) {
            res.status(200).json(config);
        } else {
            res.status(200).json({ 
                configured: false,
                message: 'Supabase configuration not found in environment variables'
            });
        }
    } catch (error) {
        console.error('Config API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
