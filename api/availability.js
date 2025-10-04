// Vercel Serverless Function - Get Available Time Slots
// /api/availability.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { barber_id, date, duration_minutes } = req.query;

  if (!barber_id || !date || !duration_minutes) {
    return res.status(400).json({ 
      error: 'Missing required parameters: barber_id, date, duration_minutes' 
    });
  }

  try {
    // Get available slots using the database function
    const { data: availableSlots, error } = await supabase
      .rpc('get_available_slots', {
        p_barber_id: barber_id,
        p_date: date,
        p_duration_minutes: parseInt(duration_minutes)
      });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch availability' });
    }

    // Format the time slots for frontend consumption
    const formattedSlots = availableSlots.map(slot => {
      const time = slot.slot_time;
      const displayTime = new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      return {
        time: time,
        display: displayTime,
        available: true
      };
    });

    res.status(200).json({ slots: formattedSlots });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
