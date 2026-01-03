-- Create function to auto-create trips when orders are placed
CREATE OR REPLACE FUNCTION public.create_trip_for_order()
RETURNS TRIGGER AS $$
DECLARE
  vendor_location TEXT;
  vendor_state TEXT;
  delivery_addr TEXT;
  order_weight NUMERIC;
  trip_type delivery_type;
  earnings NUMERIC;
BEGIN
  -- Get vendor farm location and state
  SELECT v.farm_location, v.state INTO vendor_location, vendor_state
  FROM vendors v
  WHERE v.id = NEW.vendor_id;
  
  -- Get delivery address
  SELECT a.full_address || ', ' || a.lga || ', ' || a.state INTO delivery_addr
  FROM addresses a
  WHERE a.id = NEW.delivery_address_id;
  
  -- Default delivery type to live_cattle
  trip_type := 'live_cattle'::delivery_type;
  
  -- Calculate rider earnings (70% of delivery fee)
  earnings := NEW.delivery_fee * 0.7;
  
  -- Create the trip
  INSERT INTO trips (
    order_id, 
    status, 
    delivery_type, 
    delivery_fee, 
    rider_earnings,
    pickup_address, 
    dropoff_address, 
    estimated_distance_km, 
    estimated_duration_minutes
  ) VALUES (
    NEW.id, 
    'pending'::trip_status, 
    trip_type, 
    NEW.delivery_fee, 
    earnings,
    COALESCE(vendor_location || ', ' || vendor_state, 'Vendor Location'), 
    COALESCE(delivery_addr, 'Delivery Address'),
    50, 
    120
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION create_trip_for_order();

-- Insert demo rider for testing (only if doesn't exist)
INSERT INTO riders (user_id, phone, verification_status, is_online, rating, total_trips)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  '+234 800 TEST 001',
  'verified',
  true,
  4.8,
  25
WHERE NOT EXISTS (
  SELECT 1 FROM riders WHERE phone = '+234 800 TEST 001'
);

-- Create wallet for demo rider
INSERT INTO rider_wallets (rider_id, balance, total_earned)
SELECT id, 15000, 125000 
FROM riders 
WHERE phone = '+234 800 TEST 001'
AND NOT EXISTS (
  SELECT 1 FROM rider_wallets rw 
  JOIN riders r ON r.id = rw.rider_id 
  WHERE r.phone = '+234 800 TEST 001'
);