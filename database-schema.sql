-- West Coast Kutz Booking System Database Schema
-- Optimized for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Barbers table
CREATE TABLE barbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    specialties TEXT[],
    bio TEXT,
    image_url VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL, -- for URL routing (classic-cut, skin-fade, etc.)
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price_dollars DECIMAL(10,2) NOT NULL, -- store in dollars with 2 decimal places
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barber availability/schedule
CREATE TABLE barber_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments/bookings
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID REFERENCES barbers(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price_dollars DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
    payment_intent_id VARCHAR(100), -- Stripe payment intent ID
    notes TEXT,
    sms_sent BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked time slots (for holidays, breaks, etc.)
CREATE TABLE blocked_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data
INSERT INTO barbers (name, nickname, specialties, bio, phone, email) VALUES 
('Jay', 'LineKing', ARRAY['Fades', 'Tapers', 'Beard Work'], '8 years perfecting crisp fades and sharp line-ups.', '(402) 555-0101', 'jay@westcoastkutz.com'),
('Mia', 'Shears', ARRAY['Designs', 'Kids Cuts', 'Classic Styles'], 'Creative cuts with precision.', '(402) 555-0102', 'mia@westcoastkutz.com');

INSERT INTO services (name, slug, description, duration_minutes, price_dollars) VALUES
('Classic Cut', 'classic-cut', 'A timeless haircut that never goes out of style.', 30, 25.00),
('Skin Fade', 'skin-fade', 'A seamless transition from skin to hair for a sharp look.', 45, 30.00),
('Beard Trim', 'beard-trim', 'Precision beard shaping and detailing for a polished look.', 20, 15.00),
('Full Service', 'full-service', 'Complete cut and beard trim package.', 60, 40.00),
('Kids Cut', 'kids-cut', 'Gentle, fun cuts for children 12 and under.', 25, 20.00),
('Design Cut', 'design-cut', 'Custom designs and artistic cuts.', 50, 3500);

-- Default schedules (Tuesday-Saturday, 9 AM - 6 PM)
INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time) 
SELECT b.id, dow, '09:00'::time, '18:00'::time
FROM barbers b
CROSS JOIN generate_series(2, 6) AS dow; -- Tuesday(2) through Saturday(6)

-- Indexes for performance
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_barber_date ON appointments(barber_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_barber_schedules_barber_day ON barber_schedules(barber_id, day_of_week);

-- Row Level Security (RLS) policies for Supabase
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'barber')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery images table
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero images table
CREATE TABLE hero_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update appointments table to link to user profiles
ALTER TABLE appointments ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE appointments ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN display_order INTEGER DEFAULT 0;

-- Insert default gallery images
INSERT INTO gallery_images (image_url, alt_text, display_order, is_active) VALUES
('http://static.photos/black/640x360/10', 'Barber work showcase 1', 1, true),
('http://static.photos/black/640x360/11', 'Barber work showcase 2', 2, true),
('http://static.photos/black/640x360/12', 'Barber work showcase 3', 3, true),
('http://static.photos/black/640x360/13', 'Barber work showcase 4', 4, true),
('http://static.photos/black/640x360/14', 'Barber work showcase 5', 5, true),
('http://static.photos/black/640x360/15', 'Barber work showcase 6', 6, true);

-- Insert default hero image
INSERT INTO hero_images (image_url, alt_text, is_active) VALUES
('http://static.photos/black/1920x1080/1', 'West Coast Kutz Hero Background', true);

-- Row Level Security policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

-- Public read access for barbers and services
CREATE POLICY "Public read access for barbers" ON barbers FOR SELECT USING (true);
CREATE POLICY "Public read access for services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access for schedules" ON barber_schedules FOR SELECT USING (true);
CREATE POLICY "Public read access for gallery" ON gallery_images FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for hero images" ON hero_images FOR SELECT USING (is_active = true);

-- User profiles: users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Appointments: customers can only see their own, admins can see all
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (
        auth.uid() = user_id OR
        customer_email = auth.email() OR
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'barber'))
    );

CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        customer_email = auth.email() OR
        auth.uid() IS NULL
    );

CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (
        auth.uid() = user_id OR
        customer_email = auth.email() OR
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'barber'))
    );

-- Admin-only policies for management
CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage barbers" ON barbers
    FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage gallery" ON gallery_images
    FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage hero images" ON hero_images
    FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
