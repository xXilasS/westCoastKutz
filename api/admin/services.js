// West Coast Kutz - Admin Services API
// CRUD operations for services management

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(req, supabase);
        if (!authResult.success) {
            return res.status(authResult.status).json({ error: authResult.error });
        }

        switch (req.method) {
            case 'GET':
                return await handleGetServices(req, res, supabase);
            case 'POST':
                return await handleCreateService(req, res, supabase);
            case 'PUT':
                return await handleUpdateService(req, res, supabase);
            case 'DELETE':
                return await handleDeleteService(req, res, supabase);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Admin Services API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function verifyAdminAuth(req, supabase) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return { success: false, status: 401, error: 'Authorization required' };
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return { success: false, status: 401, error: 'Invalid authentication' };
        }

        // Verify admin role
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return { success: false, status: 403, error: 'Admin access required' };
        }

        return { success: true, user };
    } catch (error) {
        console.error('Auth verification error:', error);
        return { success: false, status: 500, error: 'Authentication verification failed' };
    }
}

async function handleGetServices(req, res, supabase) {
    try {
        const { data: services, error } = await supabase
            .from('services')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        res.status(200).json({ services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
}

async function handleCreateService(req, res, supabase) {
    try {
        const { name, description, price, duration_minutes, display_order, is_active } = req.body;

        // Validate required fields
        if (!name || !price || !duration_minutes) {
            return res.status(400).json({ error: 'Name, price, and duration are required' });
        }

        const { data: service, error } = await supabase
            .from('services')
            .insert({
                name,
                description: description || '',
                price: parseFloat(price),
                duration_minutes: parseInt(duration_minutes),
                display_order: parseInt(display_order) || 0,
                is_active: is_active !== false
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ service });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
}

async function handleUpdateService(req, res, supabase) {
    try {
        const { id } = req.query;
        const { name, description, price, duration_minutes, display_order, is_active } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Service ID is required' });
        }

        // Validate required fields
        if (!name || !price || !duration_minutes) {
            return res.status(400).json({ error: 'Name, price, and duration are required' });
        }

        const { data: service, error } = await supabase
            .from('services')
            .update({
                name,
                description: description || '',
                price: parseFloat(price),
                duration_minutes: parseInt(duration_minutes),
                display_order: parseInt(display_order) || 0,
                is_active: is_active !== false,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.status(200).json({ service });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
}

async function handleDeleteService(req, res, supabase) {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Service ID is required' });
        }

        // Check for existing appointments
        const { data: appointments } = await supabase
            .from('appointments')
            .select('id')
            .eq('service_id', id)
            .limit(1);

        if (appointments && appointments.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete service with existing appointments. Deactivate instead.' 
            });
        }

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
}
