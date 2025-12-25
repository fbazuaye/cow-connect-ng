import { Link } from "react-router-dom";
import { ArrowRight, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* For Buyers */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-forest-dark p-8 lg:p-12">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/5" />
            
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 font-display text-2xl font-bold text-white lg:text-3xl">
                Ready to Buy?
              </h3>
              <p className="mb-6 text-white/80">
                Join thousands of satisfied customers who trust MooMarket for their cattle needs. 
                Browse our marketplace and find the perfect livestock today.
              </p>
              <Button size="lg" variant="secondary" asChild className="group">
                <Link to="/marketplace">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* For Vendors */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-earth-dark p-8 lg:p-12">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/5" />
            
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <Store className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-4 font-display text-2xl font-bold text-white lg:text-3xl">
                Become a Vendor
              </h3>
              <p className="mb-6 text-white/80">
                Are you a cattle farmer? Expand your reach to customers across all 36 states of Nigeria. 
                Join our network of verified vendors today.
              </p>
              <Button size="lg" asChild className="group bg-gold text-foreground hover:bg-gold-light">
                <Link to="/vendor/register">
                  Register as Vendor
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
