-- Add 'rider' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rider';

-- Riders table (extends user profiles for rider-specific data)
CREATE TABLE public.riders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    id_document_url TEXT,
    selfie_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    is_online BOOLEAN DEFAULT false,
    current_location JSONB,
    rating NUMERIC DEFAULT 0,
    total_trips INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    compliance_score NUMERIC DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vehicles table
CREATE TABLE public.vehicles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id UUID NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('motorcycle', 'van', 'refrigerated_van', 'livestock_truck')),
    plate_number TEXT NOT NULL,
    model TEXT,
    color TEXT,
    capacity_kg NUMERIC,
    is_active BOOLEAN DEFAULT true,
    documents_url TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Delivery types enum
CREATE TYPE public.delivery_type AS ENUM ('live_cattle', 'processed_meat');

-- Trip status enum
CREATE TYPE public.trip_status AS ENUM (
    'pending',
    'assigned',
    'accepted',
    'picking_up',
    'picked_up',
    'in_transit',
    'arrived',
    'delivered',
    'cancelled'
);

-- Trips/Deliveries table
CREATE TABLE public.trips (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES public.riders(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    delivery_type delivery_type NOT NULL,
    status trip_status NOT NULL DEFAULT 'pending',
    pickup_address TEXT NOT NULL,
    pickup_coordinates JSONB,
    dropoff_address TEXT NOT NULL,
    dropoff_coordinates JSONB,
    pickup_verification_photo TEXT,
    pickup_notes TEXT,
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivery_verification_photo TEXT,
    delivery_signature TEXT,
    delivery_notes TEXT,
    delivery_time TIMESTAMP WITH TIME ZONE,
    estimated_distance_km NUMERIC,
    estimated_duration_minutes INTEGER,
    actual_distance_km NUMERIC,
    actual_duration_minutes INTEGER,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    rider_earnings NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time tracking table
CREATE TABLE public.trip_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL REFERENCES public.riders(id),
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    heading NUMERIC,
    speed NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rider wallet table
CREATE TABLE public.rider_wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id UUID NOT NULL UNIQUE REFERENCES public.riders(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL DEFAULT 0,
    total_earned NUMERIC NOT NULL DEFAULT 0,
    total_withdrawn NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wallet transactions table
CREATE TABLE public.wallet_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES public.rider_wallets(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id),
    type TEXT NOT NULL CHECK (type IN ('earning', 'withdrawal', 'bonus', 'deduction')),
    amount NUMERIC NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rider reviews table
CREATE TABLE public.rider_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id UUID NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    reviewer_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incident reports (panic button)
CREATE TABLE public.incidents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id UUID NOT NULL REFERENCES public.riders(id),
    trip_id UUID REFERENCES public.trips(id),
    type TEXT NOT NULL CHECK (type IN ('panic', 'accident', 'breakdown', 'other')),
    description TEXT,
    location JSONB,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'responding', 'resolved')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for riders
CREATE POLICY "Riders can view their own profile" ON public.riders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Riders can update their own profile" ON public.riders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create rider profile" ON public.riders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all riders" ON public.riders
    FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all riders" ON public.riders
    FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for vehicles
CREATE POLICY "Riders can manage their vehicles" ON public.vehicles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.riders WHERE riders.id = vehicles.rider_id AND riders.user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all vehicles" ON public.vehicles
    FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for trips
CREATE POLICY "Riders can view their assigned trips" ON public.trips
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.riders WHERE riders.id = trips.rider_id AND riders.user_id = auth.uid()
    ));

CREATE POLICY "Riders can view pending trips" ON public.trips
    FOR SELECT USING (status = 'pending' AND EXISTS (
        SELECT 1 FROM public.riders WHERE riders.user_id = auth.uid() AND riders.verification_status = 'verified'
    ));

CREATE POLICY "Riders can update their trips" ON public.trips
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.riders WHERE riders.id = trips.rider_id AND riders.user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all trips" ON public.trips
    FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Buyers can view their order trips" ON public.trips
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.orders WHERE orders.id = trips.order_id AND orders.user_id = auth.uid()
    ));

-- RLS Policies for trip_tracking
CREATE POLICY "Riders can insert tracking data" ON public.trip_tracking
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.riders WHERE riders.id = trip_tracking.rider_id AND riders.user_id = auth.uid()
    ));

CREATE POLICY "Trip participants can view tracking" ON public.trip_tracking
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.riders WHERE riders.id = trip_tracking.rider_id AND riders.user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.trips t
            JOIN public.orders o ON o.id = t.order_id
            WHERE t.id = trip_tracking.trip_id AND o.user_id = auth.uid()
        )
    );

-- RLS Policies for rider_wallets
CREATE POLICY "Riders can view their wallet" ON public.rider_wallets
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.riders WHERE riders.id = rider_wallets.rider_id AND riders.user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all wallets" ON public.rider_wallets
    FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for wallet_transactions
CREATE POLICY "Riders can view their transactions" ON public.wallet_transactions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.rider_wallets w
        JOIN public.riders r ON r.id = w.rider_id
        WHERE w.id = wallet_transactions.wallet_id AND r.user_id = auth.uid()
    ));

-- RLS Policies for rider_reviews
CREATE POLICY "Anyone can view rider reviews" ON public.rider_reviews
    FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews for completed trips" ON public.rider_reviews
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.trips t
        JOIN public.orders o ON o.id = t.order_id
        WHERE t.id = rider_reviews.trip_id AND o.user_id = auth.uid() AND t.status = 'delivered'
    ));

-- RLS Policies for incidents
CREATE POLICY "Riders can create incidents" ON public.incidents
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.riders WHERE riders.id = incidents.rider_id AND riders.user_id = auth.uid()
    ));

CREATE POLICY "Riders can view their incidents" ON public.incidents
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.riders WHERE riders.id = incidents.rider_id AND riders.user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all incidents" ON public.incidents
    FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Indexes for performance
CREATE INDEX idx_riders_user_id ON public.riders(user_id);
CREATE INDEX idx_riders_is_online ON public.riders(is_online);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_rider_id ON public.trips(rider_id);
CREATE INDEX idx_trip_tracking_trip_id ON public.trip_tracking(trip_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);

-- Trigger for updated_at
CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON public.riders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rider_wallets_updated_at BEFORE UPDATE ON public.rider_wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();