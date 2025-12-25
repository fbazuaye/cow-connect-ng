import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Filter, X } from 'lucide-react';

const BREEDS = [
  'Sokoto Gudali',
  'White Fulani',
  'Red Bororo',
  'Adamawa Gudali',
  'Muturu',
  "N'Dama",
  'Keteku',
  'Kuri',
  'Bunaji',
];

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

export interface FilterState {
  breeds: string[];
  priceRange: [number, number];
  weightRange: [number, number];
  ageRange: [number, number];
  state: string;
  certifiedOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

export const defaultFilters: FilterState = {
  breeds: [],
  priceRange: [0, 5000000],
  weightRange: [0, 1000],
  ageRange: [0, 120],
  state: '',
  certifiedOnly: false,
};

export function FilterSidebar({ filters, onFiltersChange, onReset, className }: FilterSidebarProps) {
  const updateFilters = (partial: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const toggleBreed = (breed: string) => {
    const breeds = filters.breeds.includes(breed)
      ? filters.breeds.filter((b) => b !== breed)
      : [...filters.breeds, breed];
    updateFilters({ breeds });
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value}`;
  };

  const hasActiveFilters = 
    filters.breeds.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000000 ||
    filters.weightRange[0] > 0 ||
    filters.weightRange[1] < 1000 ||
    filters.ageRange[0] > 0 ||
    filters.ageRange[1] < 120 ||
    filters.state !== '' ||
    filters.certifiedOnly;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-display font-semibold text-foreground">
          <Filter className="h-5 w-5" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={['breeds', 'price', 'location']} className="w-full">
        <AccordionItem value="breeds">
          <AccordionTrigger className="text-sm font-medium">Breed</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {BREEDS.map((breed) => (
                <label key={breed} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.breeds.includes(breed)}
                    onCheckedChange={() => toggleBreed(breed)}
                  />
                  <span className="text-sm text-foreground">{breed}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={filters.priceRange}
                min={0}
                max={5000000}
                step={50000}
                onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="weight">
          <AccordionTrigger className="text-sm font-medium">Weight (kg)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={filters.weightRange}
                min={0}
                max={1000}
                step={10}
                onValueChange={(value) => updateFilters({ weightRange: value as [number, number] })}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filters.weightRange[0]}kg</span>
                <span>{filters.weightRange[1]}kg</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="age">
          <AccordionTrigger className="text-sm font-medium">Age (months)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={filters.ageRange}
                min={0}
                max={120}
                step={6}
                onValueChange={(value) => updateFilters({ ageRange: value as [number, number] })}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filters.ageRange[0]} months</span>
                <span>{filters.ageRange[1]} months</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger className="text-sm font-medium">Location</AccordionTrigger>
          <AccordionContent>
            <Select value={filters.state} onValueChange={(state) => updateFilters({ state })}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All States</SelectItem>
                {STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="certified">
          <AccordionTrigger className="text-sm font-medium">Certification</AccordionTrigger>
          <AccordionContent>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.certifiedOnly}
                onCheckedChange={(checked) => updateFilters({ certifiedOnly: !!checked })}
              />
              <span className="text-sm text-foreground">Certified cattle only</span>
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
