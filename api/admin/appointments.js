// Admin Appointments API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ 
            error: 'Supabase configuration missing',
            message: 'Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables'
        });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Verify admin authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        switch (req.method) {
            case 'GET':
                return await getAppointments(supabase, req, res);
            case 'POST':
                return await createAppointment(supabase, req, res);
            case 'PUT':
                return await updateAppointment(supabase, req, res);
            case 'DELETE':
                return await deleteAppointment(supabase, req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Admin appointments API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

async function getAppointments(supabase, req, res) {
    try {
        // Get appointments with related data using explicit joins
        const { data: appointments, error } = await supabase
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
                barber:barbers(id, name, nickname),
                service:services(id, name, price_dollars, duration_minutes),

            `)
            .order('appointment_date', { ascending: false })
            .order('appointment_time', { ascending: false });

        if (error) {
            console.error('Error fetching appointments:', error);
            return res.status(400).json({ 
                error: 'Failed to fetch appointments',
                details: error.message 
            });
        }

        // Transform the data to handle missing relationships gracefully
        const transformedAppointments = appointments.map(appointment => ({
            ...appointment,
            barber_name: appointment.barber?.name || 'Unknown Barber',
            barber_nickname: appointment.barber?.nickname || '',
            service_name: appointment.service?.name || 'Unknown Service',
            service_price: appointment.service?.price_dollars || appointment.price_dollars,
            service_duration: appointment.service?.duration_minutes || appointment.duration_minutes,
            customer_full_name: appointment.user_profile?.full_name || appointment.customer_name,
            customer_profile_email: appointment.user_profile?.email || appointment.customer_email,
            customer_profile_phone: appointment.user_profile?.phone || appointment.customer_phone
        }));

        return res.status(200).json({ 
            appointments: transformedAppointments,
            count: transformedAppointments.length 
        });
    } catch (error) {
        console.error('Error in getAppointments:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch appointments',
            message: error.message 
        });
    }
}

async function createAppointment(supabase, req, res) {
    try {
        const appointmentData = req.body;
        
        const { data, error } = await supabase
            .from('appointments')
            .insert([appointmentData])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ 
                error: 'Failed to create appointment',
                details: error.message 
            });
        }

        return res.status(201).json({ appointment: data });
    } catch (error) {
        console.error('Error creating appointment:', error);
        return res.status(500).json({ 
            error: 'Failed to create appointment',
            message: error.message 
        });
    }
}

async function updateAppointment(supabase, req, res) {
    try {
        const { id } = req.query;
        const updateData = req.body;

        const { data, error } = await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ 
                error: 'Failed to update appointment',
                details: error.message 
            });
        }

        return res.status(200).json({ appointment: data });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return res.status(500).json({ 
            error: 'Failed to update appointment',
            message: error.message 
        });
    }
}

async function deleteAppointment(supabase, req, res) {
    try {
        const { id } = req.query;

        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ 
                error: 'Failed to delete appointment',
                details: error.message 
            });
        }

        return res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return res.status(500).json({ 
            error: 'Failed to delete appointment',
            message: error.message 
        });
    }
}
