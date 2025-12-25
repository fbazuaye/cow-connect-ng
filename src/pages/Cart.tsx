import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Truck,
  ChevronLeft,
  Loader2,
  ShoppingBag,
} from 'lucide-react';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

export default function Cart() {
  const { items, isLoading, removeFromCart, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();
  const [deliveryState, setDeliveryState] = useState('');

  const { data: deliveryZone } = useQuery({
    queryKey: ['delivery-zone', deliveryState],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('state', deliveryState)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!deliveryState,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const deliveryFee = deliveryZone?.base_delivery_fee || 0;
  const total = subtotal + deliveryFee;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Sign in to view your cart
            </h1>
            <p className="text-muted-foreground mb-6">
              Please log in to access your shopping cart
            </p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-16 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground mb-6">
                  Browse our marketplace and add some quality cattle to your cart
                </p>
                <Button asChild>
                  <Link to="/marketplace">Browse Marketplace</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Image */}
                        <Link
                          to={`/livestock/${item.livestock_id}`}
                          className="shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-muted"
                        >
                          <img
                            src={item.livestock?.images?.[0] || '/placeholder.svg'}
                            alt={item.livestock?.title || 'Livestock'}
                            className="h-full w-full object-cover"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/livestock/${item.livestock_id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.livestock?.title || 'Livestock'}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {item.livestock?.breed}
                          </p>
                          {item.livestock?.vendor && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {item.livestock.vendor.farm_name}, {item.livestock.vendor.state}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Price & Remove */}
                            <div className="flex items-center gap-4">
                              <p className="font-semibold text-primary">
                                {formatPrice((item.livestock?.price || 0) * item.quantity)}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="border-border sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Delivery State Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Delivery Location
                      </label>
                      <Select value={deliveryState} onValueChange={setDeliveryState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIGERIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
                        </span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="font-medium">
                          {deliveryState ? (
                            deliveryZone ? (
                              formatPrice(deliveryFee)
                            ) : (
                              <span className="text-destructive">Not available</span>
                            )
                          ) : (
                            'Select state'
                          )}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {deliveryState && deliveryZone ? formatPrice(total) : formatPrice(subtotal)}
                      </span>
                    </div>

                    {deliveryState && !deliveryZone && (
                      <p className="text-sm text-destructive">
                        Sorry, delivery is not available to {deliveryState}. Please contact us for
                        special arrangements.
                      </p>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!deliveryState || !deliveryZone}
                    >
                      Proceed to Checkout
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secure checkout • 100% money-back guarantee
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
