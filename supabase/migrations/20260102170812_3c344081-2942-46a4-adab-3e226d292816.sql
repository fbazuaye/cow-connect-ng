-- Allow vendors to update their own orders (for status updates)
CREATE POLICY "Vendors can update orders for their products" 
ON public.orders 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM vendors
  WHERE vendors.id = orders.vendor_id 
  AND vendors.user_id = auth.uid()
));