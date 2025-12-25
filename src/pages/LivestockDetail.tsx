import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import {
  ShoppingCart,
  MapPin,
  Weight,
  Calendar,
  Shield,
  Star,
  Truck,
  Heart,
  Phone,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import cattleWhiteFulani from "@/assets/cattle-white-fulani.jpg";
import cattleSokotoGudali from "@/assets/cattle-sokoto-gudali.jpg";
import cattleRedBororo from "@/assets/cattle-red-bororo.jpg";
import cattleNdama from "@/assets/cattle-ndama.jpg";

// Map breeds to images
const breedImages: Record<string, string> = {
  "White Fulani": cattleWhiteFulani,
  "Sokoto Gudali": cattleSokotoGudali,
  "Red Bororo": cattleRedBororo,
  "Ndama": cattleNdama,
};

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

export default function LivestockDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [deliveryState, setDeliveryState] = useState('');

  const { data: livestock, isLoading, error } = useQuery({
    queryKey: ['livestock', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('livestock')
        .select(`
          *,
          vendor:vendors (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as (Tables<'livestock'> & { vendor: Tables<'vendors'> }) | null;
    },
    enabled: !!id,
  });

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

  const handleAddToCart = () => {
    if (livestock) {
      for (let i = 0; i < quantity; i++) {
        addToCart(livestock.id);
      }
    }
  };

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

  if (error || !livestock) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Livestock not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This listing may have been removed or is no longer available.
            </p>
            <Button asChild>
              <Link to="/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const defaultImage = breedImages[livestock.breed] || cattleWhiteFulani;
  const images = livestock.images?.length ? livestock.images : [defaultImage];
  const deliveryFee = deliveryZone?.base_delivery_fee || null;
  const totalPrice = livestock.price * quantity + (deliveryFee || 0);

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
            Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={images[selectedImage]}
                  alt={livestock.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`shrink-0 h-20 w-20 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-primary' : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    {livestock.is_certified && (
                      <Badge className="gap-1 bg-primary text-primary-foreground mb-2">
                        <Shield className="h-3 w-3" />
                        Certified
                      </Badge>
                    )}
                    <h1 className="font-display text-3xl font-bold text-foreground">
                      {livestock.title}
                    </h1>
                    <p className="text-lg text-muted-foreground">{livestock.breed}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <p className="font-display text-4xl font-bold text-primary mt-4">
                  {formatPrice(livestock.price)}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                {livestock.weight_kg && (
                  <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{livestock.weight_kg}kg</span>
                  </div>
                )}
                {livestock.age_months && (
                  <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{livestock.age_months} months</span>
                  </div>
                )}
                {livestock.health_status && (
                  <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="font-medium capitalize">{livestock.health_status}</span>
                  </div>
                )}
              </div>

              {livestock.description && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground">{livestock.description}</p>
                </div>
              )}

              {livestock.certification_details && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Certification Details
                  </h3>
                  <p className="text-sm text-muted-foreground">{livestock.certification_details}</p>
                </div>
              )}

              <Separator />

              {/* Vendor Card */}
              {livestock.vendor && (
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted-foreground">
                            {livestock.vendor.farm_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <Link
                            to={`/vendor/${livestock.vendor.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {livestock.vendor.farm_name}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {livestock.vendor.state}
                            {livestock.vendor.rating && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-accent text-accent" />
                                  {livestock.vendor.rating.toFixed(1)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/vendor/${livestock.vendor.id}`}>View Farm</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Delivery Calculator */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={deliveryState} onValueChange={setDeliveryState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {deliveryState && (
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                      {deliveryZone ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                            <span className="font-medium">{formatPrice(livestock.price * quantity)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Delivery to {deliveryState}</span>
                            <span className="font-medium">{formatPrice(deliveryFee!)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-primary">{formatPrice(totalPrice)}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Delivery not available to {deliveryState}. Please contact vendor.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add to Cart */}
              <div className="flex gap-4">
                <Select value={quantity.toString()} onValueChange={(v) => setQuantity(parseInt(v))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="flex-1 gap-2" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>

              {/* Contact */}
              {livestock.vendor?.phone && (
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href={`tel:${livestock.vendor.phone}`}>
                    <Phone className="h-4 w-4" />
                    Contact Vendor: {livestock.vendor.phone}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
