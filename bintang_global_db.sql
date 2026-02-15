-- ================================================
-- BINTANG GLOBAL GROUP - PostgreSQL Database Schema
-- Enterprise B2B Platform for Umroh Services
-- ================================================

-- Drop existing database if exists and create new
DROP DATABASE IF EXISTS bintang_global;
CREATE DATABASE bintang_global;

-- Connect to the database
\c bintang_global;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUM TYPES
-- ================================================

-- User Roles (sesuai aplikasi)
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin_pusat',
    'admin_cabang',
    'role_invoice',
    'role_hotel',
    'role_handling',
    'role_visa',
    'role_bus',
    'role_ticket',
    'role_accounting',
    'owner'
);

-- Order Status (sesuai aplikasi)
CREATE TYPE order_status AS ENUM (
    'draft',
    'tentative',
    'pending',
    'confirmed',
    'processing',
    'completed',
    'cancelled',
    'blocked'
);

-- Invoice Status
CREATE TYPE invoice_status AS ENUM (
    'tentative',
    'definite',
    'partial',
    'paid',
    'overdue',
    'cancelled'
);

-- Payment Status
CREATE TYPE payment_status AS ENUM (
    'pending',
    'verified',
    'rejected',
    'refunded'
);

-- Product Availability Status
CREATE TYPE availability_status AS ENUM (
    'available',
    'limited',
    'unavailable',
    'sold_out'
);

-- Hotel Star Rating
CREATE TYPE star_rating AS ENUM (
    '1_star',
    '2_star',
    '3_star',
    '4_star',
    '5_star',
    'unrated'
);

-- Visa Type
CREATE TYPE visa_type AS ENUM (
    'umroh',
    'hajj',
    'tourist',
    'business'
);

-- Bus Type
CREATE TYPE bus_type AS ENUM (
    'standard',
    'premium',
    'vip',
    'executive'
);

-- Transaction Type
CREATE TYPE transaction_type AS ENUM (
    'payment',
    'refund',
    'credit_balance',
    'adjustment'
);

-- Notification Type
CREATE TYPE notification_type AS ENUM (
    'order_created',
    'payment_received',
    'invoice_updated',
    'package_available',
    'system_alert',
    'reminder'
);

-- ================================================
-- TABLE: branches
-- ================================================
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: users
-- ================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role user_role NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: owner_profiles (Extended info for owners)
-- ================================================
CREATE TABLE owner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    mou_number VARCHAR(100),
    mou_date DATE,
    mou_file_path VARCHAR(500),
    deposit_amount DECIMAL(15,2) DEFAULT 0,
    credit_balance DECIMAL(15,2) DEFAULT 0,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: hotels
-- ================================================
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255), -- Arabic name
    location VARCHAR(100) NOT NULL, -- 'makkah' or 'madinah'
    address TEXT NOT NULL,
    distance_from_haram DECIMAL(5,2), -- in KM
    star_rating star_rating DEFAULT 'unrated',
    description TEXT,
    facilities JSONB, -- Array of facilities
    images JSONB, -- Array of image URLs
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: rooms
-- ================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room_type VARCHAR(100) NOT NULL, -- e.g., 'Quad', 'Triple', 'Double'
    capacity INTEGER NOT NULL,
    total_quota INTEGER NOT NULL,
    available_quota INTEGER NOT NULL,
    price_per_room_sar DECIMAL(12,2) NOT NULL,
    meal_price_per_person_sar DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    amenities JSONB, -- Room amenities
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: visas
-- ================================================
CREATE TABLE visas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_name VARCHAR(255) NOT NULL,
    visa_type visa_type NOT NULL,
    duration_days INTEGER, -- Visa validity
    price_sar DECIMAL(12,2) NOT NULL,
    description TEXT,
    requirements JSONB, -- Array of requirements
    processing_time_days INTEGER,
    availability_status availability_status DEFAULT 'available',
    quota INTEGER,
    used_quota INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: tickets
-- ================================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline VARCHAR(100) NOT NULL,
    flight_number VARCHAR(20),
    route_from VARCHAR(100) NOT NULL,
    route_to VARCHAR(100) NOT NULL,
    departure_date DATE,
    arrival_date DATE,
    departure_time TIME,
    arrival_time TIME,
    price_sar DECIMAL(12,2) NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    class VARCHAR(50), -- Economy, Business, First Class
    baggage_allowance VARCHAR(50),
    availability_status availability_status DEFAULT 'available',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: buses
-- ================================================
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_number VARCHAR(50) NOT NULL,
    bus_type bus_type DEFAULT 'standard',
    capacity INTEGER NOT NULL DEFAULT 35,
    ideal_capacity INTEGER NOT NULL DEFAULT 35, -- For penalty calculation
    base_price_sar DECIMAL(12,2) NOT NULL,
    penalty_per_person_sar DECIMAL(10,2) DEFAULT 0,
    route VARCHAR(255), -- e.g., 'Jeddah - Makkah - Madinah'
    description TEXT,
    facilities JSONB,
    availability_status availability_status DEFAULT 'available',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: packages (Bundling Products)
-- ================================================
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_code VARCHAR(50) UNIQUE NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INTEGER, -- e.g., 9 days, 12 days
    valid_from DATE,
    valid_until DATE,
    
    -- Pricing
    base_price_sar DECIMAL(15,2) NOT NULL,
    margin_percentage DECIMAL(5,2) DEFAULT 0,
    final_price_sar DECIMAL(15,2) NOT NULL,
    
    -- Included items (JSONB for flexibility)
    included_hotels JSONB, -- Array of hotel IDs and details
    included_visas JSONB,
    included_tickets JSONB,
    included_buses JSONB,
    included_handling BOOLEAN DEFAULT FALSE,
    included_meals BOOLEAN DEFAULT FALSE,
    
    -- Quota management
    total_quota INTEGER,
    used_quota INTEGER DEFAULT 0,
    available_quota INTEGER,
    
    -- Status
    availability_status availability_status DEFAULT 'available',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: orders
-- ================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    
    -- Order details
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    departure_date DATE,
    total_jamaah INTEGER NOT NULL,
    
    -- Status
    status order_status DEFAULT 'draft',
    
    -- Pricing (in SAR)
    subtotal_sar DECIMAL(15,2) NOT NULL,
    discount_sar DECIMAL(15,2) DEFAULT 0,
    tax_sar DECIMAL(15,2) DEFAULT 0,
    total_sar DECIMAL(15,2) NOT NULL,
    
    -- Additional info
    notes TEXT,
    special_requests TEXT,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: order_items
-- ================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Product reference (polymorphic)
    product_type VARCHAR(50) NOT NULL, -- 'hotel', 'visa', 'ticket', 'bus', 'package', 'handling'
    product_id UUID, -- References specific product table
    product_name VARCHAR(255) NOT NULL,
    
    -- Quantity and pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_sar DECIMAL(12,2) NOT NULL,
    subtotal_sar DECIMAL(12,2) NOT NULL,
    
    -- Additional details (flexible JSON for different product types)
    details JSONB,
    
    -- Penalty (for bus)
    penalty_amount_sar DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: invoices
-- ================================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    
    -- Invoice details
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Amounts (in SAR)
    subtotal_sar DECIMAL(15,2) NOT NULL,
    discount_sar DECIMAL(15,2) DEFAULT 0,
    tax_sar DECIMAL(15,2) DEFAULT 0,
    total_amount_sar DECIMAL(15,2) NOT NULL,
    paid_amount_sar DECIMAL(15,2) DEFAULT 0,
    remaining_amount_sar DECIMAL(15,2) NOT NULL,
    
    -- Status
    status invoice_status DEFAULT 'tentative',
    
    -- Minimum deposit (30%)
    minimum_deposit_sar DECIMAL(15,2) NOT NULL,
    
    -- Amendment tracking
    is_amended BOOLEAN DEFAULT FALSE,
    amendment_reason TEXT,
    amended_at TIMESTAMP,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: payments
-- ================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Payment details
    payment_date DATE DEFAULT CURRENT_DATE,
    amount_sar DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50), -- 'bank_transfer', 'cash', 'credit_card'
    
    -- Bank transfer details
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    transaction_reference VARCHAR(100),
    
    -- Proof of payment
    proof_file_path VARCHAR(500),
    proof_upload_date TIMESTAMP,
    
    -- Status
    status payment_status DEFAULT 'pending',
    
    -- Verification
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    verification_notes TEXT,
    
    -- Rejection
    rejection_reason TEXT,
    rejected_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: credit_balances
-- ================================================
CREATE TABLE credit_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type transaction_type NOT NULL,
    amount_sar DECIMAL(15,2) NOT NULL,
    balance_before_sar DECIMAL(15,2) NOT NULL,
    balance_after_sar DECIMAL(15,2) NOT NULL,
    
    -- Reference
    reference_type VARCHAR(50), -- 'invoice', 'refund', 'adjustment'
    reference_id UUID, -- References invoice or other entity
    description TEXT,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: currencies
-- ================================================
CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency_code VARCHAR(3) NOT NULL, -- 'SAR', 'IDR', 'USD'
    currency_name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10),
    exchange_rate_to_sar DECIMAL(12,4) NOT NULL, -- Rate to convert to SAR
    is_base_currency BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: sales_policies
-- ================================================
CREATE TABLE sales_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- 'bundling', 'restriction', 'discount'
    description TEXT,
    
    -- Rules (flexible JSON structure)
    rules JSONB NOT NULL,
    
    -- Validity
    valid_from DATE,
    valid_until DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: custom_pricing
-- ================================================
CREATE TABLE custom_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Product reference
    product_type VARCHAR(50) NOT NULL,
    product_id UUID NOT NULL,
    
    -- Custom pricing
    standard_price_sar DECIMAL(12,2) NOT NULL,
    custom_price_sar DECIMAL(12,2) NOT NULL,
    discount_percentage DECIMAL(5,2),
    
    -- Negotiation
    requested_price_sar DECIMAL(12,2),
    negotiation_notes TEXT,
    
    -- Validity
    valid_from DATE,
    valid_until DATE,
    
    -- Status
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: notifications
-- ================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification details
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Reference
    reference_type VARCHAR(50), -- 'order', 'invoice', 'package'
    reference_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: system_settings
-- ================================================
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    category VARCHAR(50), -- 'general', 'payment', 'notification', 'security'
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: audit_logs
-- ================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    entity_type VARCHAR(100), -- Table name
    entity_id UUID, -- Record ID
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: reports_cache
-- ================================================
CREATE TABLE reports_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(100) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    parameters JSONB,
    file_path VARCHAR(500),
    file_format VARCHAR(10), -- 'pdf', 'excel'
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Owner Profiles
CREATE INDEX idx_owner_profiles_user_id ON owner_profiles(user_id);
CREATE INDEX idx_owner_profiles_branch_id ON owner_profiles(branch_id);
CREATE INDEX idx_owner_profiles_is_approved ON owner_profiles(is_approved);

-- Hotels
CREATE INDEX idx_hotels_location ON hotels(location);
CREATE INDEX idx_hotels_is_active ON hotels(is_active);

-- Rooms
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_is_active ON rooms(is_active);

-- Visas
CREATE INDEX idx_visas_visa_type ON visas(visa_type);
CREATE INDEX idx_visas_availability_status ON visas(availability_status);

-- Tickets
CREATE INDEX idx_tickets_route ON tickets(route_from, route_to);
CREATE INDEX idx_tickets_departure_date ON tickets(departure_date);
CREATE INDEX idx_tickets_availability_status ON tickets(availability_status);

-- Buses
CREATE INDEX idx_buses_availability_status ON buses(availability_status);

-- Packages
CREATE INDEX idx_packages_package_code ON packages(package_code);
CREATE INDEX idx_packages_validity ON packages(valid_from, valid_until);
CREATE INDEX idx_packages_is_active ON packages(is_active);

-- Orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_owner_id ON orders(owner_id);
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_type ON order_items(product_type);

-- Invoices
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_owner_id ON invoices(owner_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Payments
CREATE INDEX idx_payments_payment_number ON payments(payment_number);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_owner_id ON payments(owner_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Credit Balances
CREATE INDEX idx_credit_balances_owner_id ON credit_balances(owner_id);
CREATE INDEX idx_credit_balances_transaction_type ON credit_balances(transaction_type);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owner_profiles_updated_at BEFORE UPDATE ON owner_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visas_updated_at BEFORE UPDATE ON visas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON currencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_policies_updated_at BEFORE UPDATE ON sales_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_pricing_updated_at BEFORE UPDATE ON custom_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update available quota when booking
CREATE OR REPLACE FUNCTION update_room_quota()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_type = 'hotel' THEN
        UPDATE rooms 
        SET available_quota = available_quota - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_room_quota AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_room_quota();

-- Function to update invoice remaining amount
CREATE OR REPLACE FUNCTION update_invoice_remaining()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices 
    SET 
        paid_amount_sar = (
            SELECT COALESCE(SUM(amount_sar), 0) 
            FROM payments 
            WHERE invoice_id = NEW.invoice_id 
            AND status = 'verified'
        ),
        remaining_amount_sar = total_amount_sar - (
            SELECT COALESCE(SUM(amount_sar), 0) 
            FROM payments 
            WHERE invoice_id = NEW.invoice_id 
            AND status = 'verified'
        ),
        status = CASE 
            WHEN (total_amount_sar - (
                SELECT COALESCE(SUM(amount_sar), 0) 
                FROM payments 
                WHERE invoice_id = NEW.invoice_id 
                AND status = 'verified'
            )) <= 0 THEN 'paid'::invoice_status
            WHEN (
                SELECT COALESCE(SUM(amount_sar), 0) 
                FROM payments 
                WHERE invoice_id = NEW.invoice_id 
                AND status = 'verified'
            ) > 0 THEN 'partial'::invoice_status
            ELSE status
        END
    WHERE id = NEW.invoice_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_remaining AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_invoice_remaining();

-- Function to update owner credit balance
CREATE OR REPLACE FUNCTION update_owner_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE owner_profiles
    SET credit_balance = NEW.balance_after_sar
    WHERE user_id = NEW.owner_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_owner_credit_balance AFTER INSERT ON credit_balances
    FOR EACH ROW EXECUTE FUNCTION update_owner_credit_balance();

-- ================================================
-- INITIAL DATA SEEDING
-- ================================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
('company_name', 'Bintang Global Group', 'string', 'Company name', 'general'),
('default_currency', 'SAR', 'string', 'Default currency', 'general'),
('minimum_deposit_percentage', '30', 'number', 'Minimum deposit percentage', 'payment'),
('invoice_due_days', '7', 'number', 'Invoice due date in days', 'payment'),
('email_notification_enabled', 'true', 'boolean', 'Enable email notifications', 'notification'),
('sms_notification_enabled', 'false', 'boolean', 'Enable SMS notifications', 'notification');

-- Insert default currencies
INSERT INTO currencies (currency_code, currency_name, symbol, exchange_rate_to_sar, is_base_currency, is_active) VALUES
('SAR', 'Saudi Riyal', 'ر.س', 1.0000, TRUE, TRUE),
('IDR', 'Indonesian Rupiah', 'Rp', 0.0010, FALSE, TRUE),
('USD', 'US Dollar', '$', 3.7500, FALSE, TRUE);

-- ================================================
-- VIEWS FOR REPORTING
-- ================================================

-- View: Active Hotels with Room Summary
CREATE OR REPLACE VIEW v_hotels_summary AS
SELECT 
    h.id,
    h.name,
    h.location,
    h.star_rating,
    h.distance_from_haram,
    COUNT(r.id) as total_room_types,
    SUM(r.total_quota) as total_rooms,
    SUM(r.available_quota) as available_rooms,
    MIN(r.price_per_room_sar) as min_price,
    MAX(r.price_per_room_sar) as max_price,
    h.is_active
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id AND r.is_active = TRUE
WHERE h.is_active = TRUE
GROUP BY h.id, h.name, h.location, h.star_rating, h.distance_from_haram, h.is_active;

-- View: Order Summary with Invoice Status
CREATE OR REPLACE VIEW v_orders_summary AS
SELECT 
    o.id,
    o.order_number,
    o.order_date,
    o.departure_date,
    u.name as owner_name,
    u.email as owner_email,
    b.name as branch_name,
    o.total_jamaah,
    o.status as order_status,
    o.total_sar,
    i.invoice_number,
    i.status as invoice_status,
    i.paid_amount_sar,
    i.remaining_amount_sar
FROM orders o
LEFT JOIN users u ON o.owner_id = u.id
LEFT JOIN branches b ON o.branch_id = b.id
LEFT JOIN invoices i ON o.id = i.order_id;

-- View: Owner Balance Summary
CREATE OR REPLACE VIEW v_owner_balance_summary AS
SELECT 
    u.id as owner_id,
    u.name,
    u.email,
    op.company_name,
    op.deposit_amount,
    op.credit_balance,
    op.credit_limit,
    op.total_orders,
    op.total_spent,
    b.name as branch_name
FROM users u
JOIN owner_profiles op ON u.id = op.user_id
LEFT JOIN branches b ON op.branch_id = b.id
WHERE u.role = 'owner' AND u.is_active = TRUE;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON DATABASE bintang_global IS 'Bintang Global Group - Enterprise B2B Platform Database';
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE owner_profiles IS 'Extended profile information for owner users';
COMMENT ON TABLE hotels IS 'Hotel properties in Makkah and Madinah';
COMMENT ON TABLE rooms IS 'Hotel room types with availability management';
COMMENT ON TABLE packages IS 'Bundled product packages with special pricing';
COMMENT ON TABLE orders IS 'Customer orders containing multiple items';
COMMENT ON TABLE invoices IS 'Invoice generation with payment tracking';
COMMENT ON TABLE payments IS 'Payment records with proof upload';
COMMENT ON TABLE credit_balances IS 'Owner credit balance transaction history';

-- ================================================
-- COMPLETION
-- ================================================

\echo '================================================'
\echo 'Database schema created successfully!'
\echo '================================================'
\echo ''
\echo 'Next steps:'
\echo '1. Di folder backend: npm run seed  (isi akun semua role + 3 owner, password: Password123)'
\echo '2. Start backend: npm start'
\echo '3. Start frontend: npm start'
\echo ''
\echo 'Akun seed: superadmin@bintangglobal.com, adminpusat@bintangglobal.com, owner1@bintangglobal.com, dll.'
\echo ''
\echo 'Database: bintang_global'
\echo 'Tables created: 30+'
\echo 'Indexes created: 40+'
\echo 'Triggers created: 20+'
\echo 'Views created: 3'
\echo '================================================'
