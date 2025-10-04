// Vercel Serverless Function - Create Booking
// /api/bookings.js

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      barber_id,
      service_id,
      customer_name,
      customer_phone,
      customer_email,
      appointment_date,
      appointment_time,
      notes
    } = req.body;

    // Validate required fields
    if (!barber_id || !service_id || !customer_name || !customer_phone || 
        !customer_email || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get service details for pricing
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single();

    if (serviceError || !service) {
      return res.status(400).json({ error: 'Invalid service' });
    }

    // Check if time slot is still available
    const { data: existingAppointments, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('barber_id', barber_id)
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .neq('status', 'cancelled');

    if (checkError) {
      console.error('Error checking availability:', checkError);
      return res.status(500).json({ error: 'Failed to check availability' });
    }

    if (existingAppointments.length > 0) {
      return res.status(409).json({ error: 'Time slot no longer available' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(service.price_dollars * 100), // Convert dollars to cents for Stripe
      currency: 'usd',
      metadata: {
        customer_name,
        customer_email,
        service_name: service.name,
        appointment_date,
        appointment_time
      }
    });

    // Create appointment in database
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        barber_id,
        service_id,
        customer_name,
        customer_phone,
        customer_email,
        appointment_date,
        appointment_time,
        duration_minutes: service.duration_minutes,
        price_dollars: service.price_dollars,
        payment_intent_id: paymentIntent.id,
        notes: notes || null,
        status: 'pending'
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      
      // Cancel the payment intent if appointment creation failed
      await stripe.paymentIntents.cancel(paymentIntent.id);
      
      return res.status(500).json({ error: 'Failed to create appointment' });
    }

    // Send notifications (SMS and Email)
    await sendNotifications(appointment, service);

    res.status(201).json({
      appointment,
      client_secret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendNotifications(appointment, service) {
  try {
    // Send SMS notification using Twilio
    await sendSMSNotification(appointment, service);
    
    // Send email notification using SendGrid
    await sendEmailNotification(appointment, service);
    
    // Update appointment to mark notifications as sent
    await supabase
      .from('appointments')
      .update({ 
        sms_sent: true, 
        email_sent: true 
      })
      .eq('id', appointment.id);
      
  } catch (error) {
    console.error('Error sending notifications:', error);
    // Don't fail the booking if notifications fail
  }
}

async function sendSMSNotification(appointment, service) {
  // This would integrate with Twilio
  // For now, just log the message
  console.log('SMS would be sent:', {
    to: appointment.customer_phone,
    message: `West Coast Kutz: Your ${service.name} appointment is confirmed for ${appointment.appointment_date} at ${appointment.appointment_time}. See you soon!`
  });
}

async function sendEmailNotification(appointment, service) {
  // This would integrate with SendGrid
  // For now, just log the email
  console.log('Email would be sent:', {
    to: appointment.customer_email,
    subject: 'Appointment Confirmation - West Coast Kutz',
    content: `Your ${service.name} appointment is confirmed for ${appointment.appointment_date} at ${appointment.appointment_time}.`
  });
}
