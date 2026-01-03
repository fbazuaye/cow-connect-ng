import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, Truck, ExternalLink, Package, MapPin, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface Livestock {
  id: string;
  title: string;
  breed: string;
  price: number;
  weight_kg: number | null;
  images: string[] | null;
  vendor_id: string;
  vendors?: {
    farm_name: string;
    farm_location: string;
    state: string;
  };
}

interface DeliveryZone {
  id: string;
  state: string;
  base_delivery_fee: number;
}

interface OrderResult {
  orderId: string;
  orderNumber: string;
  tripId?: string;
}

const TestOrder = () => {
  const navigate = useNavigate();
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedLivestock, setSelectedLivestock] = useState<Livestock | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("+234 ");
  const [isLoading, setIsLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [livestockRes, zonesRes] = await Promise.all([
      supabase
        .from("livestock")
        .select("*, vendors(farm_name, farm_location, state)")
        .eq("is_available", true)
        .limit(6),
      supabase.from("delivery_zones").select("*").eq("is_active", true),
    ]);

    if (livestockRes.data) setLivestock(livestockRes.data);
    if (zonesRes.data) setDeliveryZones(zonesRes.data);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(price);

  const getDeliveryFee = () => {
    const zone = deliveryZones.find((z) => z.state === selectedState);
    return zone?.base_delivery_fee || 15000;
  };

  const generateOrderNumber = () => {
    const prefix = "MLM";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handlePlaceOrder = async () => {
    console.log("Place order clicked", { selectedLivestock, selectedState, address, phone });
    
    if (!selectedLivestock) {
      toast.error("Please select a livestock item");
      return;
    }
    if (!selectedState) {
      toast.error("Please select a delivery state");
      return;
    }
    if (!address) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (!phone || phone.trim() === "+234 ") {
      toast.error("Please enter a phone number");
      return;
    }

    setIsLoading(true);

    try {
      // Get or create a test user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("Auth check:", { user, authError });

      if (!user) {
        toast.error("Please sign in first — you'll be returned to Test Order after login.");
        navigate("/auth?redirect=/test-order");
        return;
      }

      const deliveryFee = getDeliveryFee();
      const subtotal = selectedLivestock.price;
      const total = subtotal + deliveryFee;
      const orderNumber = generateOrderNumber();

      // Create address first
      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          label: "Test Delivery",
          full_address: address,
          state: selectedState,
          phone: phone,
          is_default: false,
        })
        .select()
        .single();

      if (addressError) throw addressError;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          vendor_id: selectedLivestock.vendor_id,
          order_number: orderNumber,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total,
          delivery_address_id: addressData.id,
          status: "confirmed",
          payment_status: "paid",
          payment_method: "bank_transfer",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderData.id,
        livestock_id: selectedLivestock.id,
        quantity: 1,
        unit_price: selectedLivestock.price,
        total_price: selectedLivestock.price,
      });

      if (itemError) throw itemError;

      // Fetch the created trip
      const { data: tripData } = await supabase
        .from("trips")
        .select("id")
        .eq("order_id", orderData.id)
        .maybeSingle();

      setOrderResult({
        orderId: orderData.id,
        orderNumber: orderNumber,
        tripId: tripData?.id,
      });

      toast.success("Test order placed successfully! Trip created for riders.");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (orderResult) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Test Order Placed!</CardTitle>
              <CardDescription>
                Order #{orderResult.orderNumber} has been created and a trip is now pending for riders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{orderResult.orderId.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-semibold">{orderResult.orderNumber}</span>
                </div>
                {orderResult.tripId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trip ID</span>
                    <Badge variant="secondary" className="font-mono">
                      {orderResult.tripId.slice(0, 8)}...
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Truck className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  A pending trip has been created. Riders on MaluRider can now see and accept this delivery.
                </p>
              </div>

              <div className="grid gap-3">
                <Button onClick={() => navigate("/rider")} className="w-full">
                  <Truck className="w-4 h-4 mr-2" />
                  View Rider Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("https://ride-malu-flow.lovable.app/", "_blank")}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open MaluRider App
                </Button>
                <Button variant="ghost" onClick={() => setOrderResult(null)} className="w-full">
                  Place Another Test Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-2">Testing Mode</Badge>
            <h1 className="text-3xl font-bold mb-2">Test Order Placement</h1>
            <p className="text-muted-foreground">
              Simulate an order to test the MaluMarket → MaluRider integration
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Livestock Selection */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Select Livestock
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {livestock.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedLivestock?.id === item.id
                        ? "ring-2 ring-primary border-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedLivestock(item)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.breed}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-primary">{formatPrice(item.price)}</span>
                        {item.weight_kg && (
                          <Badge variant="outline">{item.weight_kg}kg</Badge>
                        )}
                      </div>
                      {item.vendors && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📍 {item.vendors.farm_name}, {item.vendors.state}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Delivery Details */}
              <h2 className="text-lg font-semibold flex items-center gap-2 mt-8">
                <MapPin className="w-5 h-5" />
                Delivery Details
              </h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Delivery State</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryZones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.state}>
                              {zone.state} - {formatPrice(zone.base_delivery_fee)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Delivery Address</Label>
                    <Textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter full delivery address including street, city, and landmarks"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {selectedLivestock ? (
                    <>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {selectedLivestock.images?.[0] ? (
                            <img
                              src={selectedLivestock.images[0]}
                              alt={selectedLivestock.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium line-clamp-1">{selectedLivestock.title}</h4>
                          <p className="text-sm text-muted-foreground">{selectedLivestock.breed}</p>
                          <p className="text-sm font-semibold">{formatPrice(selectedLivestock.price)}</p>
                        </div>
                      </div>
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{formatPrice(selectedLivestock.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>{formatPrice(getDeliveryFee())}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total</span>
                          <span>{formatPrice(selectedLivestock.price + getDeliveryFee())}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Select a livestock item to see order summary
                    </p>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={!selectedLivestock || !selectedState || !address || isLoading}
                  >
                    {isLoading ? (
                      "Placing Order..."
                    ) : (
                      <>
                        Place Test Order
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    This will create a real order and trip in the database for testing purposes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestOrder;
