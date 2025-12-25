import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LivestockCard } from '@/components/marketplace/LivestockCard';
import { FilterSidebar, FilterState, defaultFilters } from '@/components/marketplace/FilterSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, SlidersHorizontal, Loader2, Package } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type LivestockWithVendor = Tables<'livestock'> & {
  vendor?: Tables<'vendors'>;
};

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: livestock, isLoading } = useQuery({
    queryKey: ['livestock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('livestock')
        .select(`
          *,
          vendor:vendors (*)
        `)
        .eq('is_available', true);

      if (error) throw error;
      return data as LivestockWithVendor[];
    },
  });

  const filteredLivestock = useMemo(() => {
    if (!livestock) return [];

    let result = [...livestock];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.breed.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.vendor?.farm_name.toLowerCase().includes(query)
      );
    }

    // Breed filter
    if (filters.breeds.length > 0) {
      result = result.filter((item) => filters.breeds.includes(item.breed));
    }

    // Price filter
    result = result.filter(
      (item) => item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
    );

    // Weight filter
    if (filters.weightRange[0] > 0 || filters.weightRange[1] < 1000) {
      result = result.filter(
        (item) =>
          item.weight_kg &&
          item.weight_kg >= filters.weightRange[0] &&
          item.weight_kg <= filters.weightRange[1]
      );
    }

    // Age filter
    if (filters.ageRange[0] > 0 || filters.ageRange[1] < 120) {
      result = result.filter(
        (item) =>
          item.age_months &&
          item.age_months >= filters.ageRange[0] &&
          item.age_months <= filters.ageRange[1]
      );
    }

    // State filter
    if (filters.state) {
      result = result.filter((item) => item.vendor?.state === filters.state);
    }

    // Certified filter
    if (filters.certifiedOnly) {
      result = result.filter((item) => item.is_certified);
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.vendor?.total_reviews || 0) - (a.vendor?.total_reviews || 0));
        break;
    }

    return result;
  }, [livestock, searchQuery, filters, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border bg-card">
          <div className="container py-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Marketplace
            </h1>
            <p className="text-muted-foreground">
              Browse quality cattle from verified Nigerian farms
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by breed, title, or farm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <FilterSidebar
                        filters={filters}
                        onFiltersChange={setFilters}
                        onReset={() => setFilters(defaultFilters)}
                        className="pt-6"
                      />
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Count */}
              <p className="text-sm text-muted-foreground mb-4">
                {isLoading ? 'Loading...' : `${filteredLivestock.length} cattle found`}
              </p>

              {/* Livestock Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLivestock.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredLivestock.map((item) => (
                    <LivestockCard key={item.id} livestock={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No cattle found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || filters !== defaultFilters
                      ? 'Try adjusting your filters or search query'
                      : 'No livestock available at the moment. Check back soon!'}
                  </p>
                  {(searchQuery || filters !== defaultFilters) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setFilters(defaultFilters);
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
