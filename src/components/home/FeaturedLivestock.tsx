import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Weight, Calendar, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import cattleWhiteFulani from "@/assets/cattle-white-fulani.jpg";
import cattleSokotoGudali from "@/assets/cattle-sokoto-gudali.jpg";
import cattleRedBororo from "@/assets/cattle-red-bororo.jpg";
import cattleNdama from "@/assets/cattle-ndama.jpg";

// Sample data - will be replaced with real data from database
const featuredCattle = [
  {
    id: "1",
    title: "Premium White Fulani Bull",
    breed: "White Fulani",
    age: 24,
    weight: 450,
    price: 850000,
    location: "Kano",
    isVerified: true,
    isCertified: true,
    image: cattleWhiteFulani,
  },
  {
    id: "2",
    title: "Healthy Sokoto Gudali",
    breed: "Sokoto Gudali",
    age: 18,
    weight: 380,
    price: 720000,
    location: "Sokoto",
    isVerified: true,
    isCertified: true,
    image: cattleSokotoGudali,
  },
  {
    id: "3",
    title: "Young Red Bororo Cow",
    breed: "Red Bororo",
    age: 30,
    weight: 520,
    price: 980000,
    location: "Adamawa",
    isVerified: true,
    isCertified: false,
    image: cattleRedBororo,
  },
  {
    id: "4",
    title: "Ndama Cattle",
    breed: "Ndama",
    age: 20,
    weight: 320,
    price: 580000,
    location: "Oyo",
    isVerified: true,
    isCertified: true,
    image: cattleNdama,
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export function FeaturedLivestock() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Featured Listings
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Premium Cattle Available
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/marketplace">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCattle.map((cattle) => (
            <Link
              key={cattle.id}
              to={`/livestock/${cattle.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all hover:shadow-medium"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img 
                  src={cattle.image} 
                  alt={cattle.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-2">
                  {cattle.isVerified && (
                    <Badge className="bg-primary">
                      <BadgeCheck className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  )}
                  {cattle.isCertified && (
                    <Badge variant="secondary" className="bg-gold text-foreground">
                      Health Certified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="mb-2 font-display font-semibold text-foreground group-hover:text-primary">
                  {cattle.title}
                </h3>

                <div className="mb-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {cattle.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Weight className="h-4 w-4" /> {cattle.weight}kg
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {cattle.age} months
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-bold text-primary">
                    {formatPrice(cattle.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">{cattle.breed}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
