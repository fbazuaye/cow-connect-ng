import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, Weight, Calendar, Shield, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
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

interface LivestockCardProps {
  livestock: Tables<'livestock'> & {
    vendor?: Tables<'vendors'>;
  };
}

export function LivestockCard({ livestock }: LivestockCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(livestock.id);
  };

  const primaryImage = livestock.images?.[0] || breedImages[livestock.breed] || cattleWhiteFulani;

  return (
    <Link to={`/livestock/${livestock.id}`}>
      <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={primaryImage}
            alt={livestock.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {livestock.is_certified && (
            <Badge className="absolute left-3 top-3 gap-1 bg-primary text-primary-foreground">
              <Shield className="h-3 w-3" />
              Certified
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-foreground line-clamp-1">
                {livestock.title}
              </h3>
              <p className="text-sm text-muted-foreground">{livestock.breed}</p>
            </div>
            <p className="font-display text-lg font-bold text-primary whitespace-nowrap">
              {formatPrice(livestock.price)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {livestock.weight_kg && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <Weight className="h-3 w-3" />
                {livestock.weight_kg}kg
              </span>
            )}
            {livestock.age_months && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <Calendar className="h-3 w-3" />
                {livestock.age_months} months
              </span>
            )}
            {livestock.vendor && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <MapPin className="h-3 w-3" />
                {livestock.vendor.state}
              </span>
            )}
          </div>

          {livestock.vendor && (
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {livestock.vendor.farm_name.charAt(0)}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground line-clamp-1">
                    {livestock.vendor.farm_name}
                  </p>
                  {livestock.vendor.rating && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span>{livestock.vendor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
