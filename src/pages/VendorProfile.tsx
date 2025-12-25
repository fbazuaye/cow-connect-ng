import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LivestockCard } from '@/components/marketplace/LivestockCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Shield,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

export default function VendorProfile() {
  const { id } = useParams<{ id: string }>();

  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Tables<'vendors'> | null;
    },
    enabled: !!id,
  });

  const { data: livestock, isLoading: livestockLoading } = useQuery({
    queryKey: ['vendor-livestock', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('livestock')
        .select(`
          *,
          vendor:vendors (*)
        `)
        .eq('vendor_id', id)
        .eq('is_available', true);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['vendor-reviews', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('vendor_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const isLoading = vendorLoading || livestockLoading;

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

  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Vendor not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This farm profile may have been removed or is not available.
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary to-forest-light relative">
          {vendor.banner_url && (
            <img
              src={vendor.banner_url}
              alt=""
              className="h-full w-full object-cover absolute inset-0"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        </div>

        <div className="container">
          {/* Profile Header */}
          <div className="-mt-16 relative z-10 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              <div className="h-32 w-32 rounded-2xl bg-card border-4 border-background shadow-medium flex items-center justify-center overflow-hidden">
                {vendor.logo_url ? (
                  <img src={vendor.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-muted-foreground">
                    {vendor.farm_name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 md:pt-8">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold text-foreground">
                    {vendor.farm_name}
                  </h1>
                  {vendor.is_verified && (
                    <Badge className="gap-1 bg-primary text-primary-foreground">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {vendor.farm_location}, {vendor.state}
                  </span>
                  {vendor.rating && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      {vendor.rating.toFixed(1)} ({vendor.total_reviews} reviews)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {vendor.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${vendor.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {vendor.phone}
                      </a>
                    </Button>
                  )}
                  {vendor.email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${vendor.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-3 gap-8 pb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {vendor.description && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>About the Farm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{vendor.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Livestock */}
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Available Cattle ({livestock?.length || 0})
                </h2>
                {livestock && livestock.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {livestock.map((item) => (
                      <LivestockCard key={item.id} livestock={item as any} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-border">
                    <CardContent className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        No cattle currently available from this farm.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Farm Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available Cattle</span>
                    <span className="font-semibold">{livestock?.length || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Reviews</span>
                    <span className="font-semibold">{vendor.total_reviews || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      {vendor.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-semibold">
                      {new Date(vendor.created_at).toLocaleDateString('en-NG', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              {reviews && reviews.length > 0 && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-accent text-accent'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {review.comment}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('en-NG')}
                        </p>
                        <Separator />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
