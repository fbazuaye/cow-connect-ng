import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import cattleHero from "@/assets/cattle-hero.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-forest-dark py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container relative px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
              <Award className="h-4 w-4" />
              Nigeria's #1 Trusted Livestock Marketplace
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Premium Live Cattle,{" "}
              <span className="text-gold">Delivered to Your Door</span>
            </h1>
            
            <p className="mx-auto max-w-xl text-lg text-white/80 lg:mx-0">
              Connect directly with verified farmers across Nigeria. Choose from thousands of healthy, certified cattle with guaranteed delivery to all 36 states.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" variant="secondary" asChild className="group">
                <Link to="/marketplace">
                  Browse Livestock
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/vendor/register">Become a Vendor</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 lg:justify-start">
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="h-5 w-5 text-gold" />
                <span className="text-sm">100% Secure</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Truck className="h-5 w-5 text-gold" />
                <span className="text-sm">Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Award className="h-5 w-5 text-gold" />
                <span className="text-sm">Verified Farms</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Stats */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              {/* Professional Cattle Image */}
              <div className="aspect-square overflow-hidden rounded-xl">
                <img 
                  src={cattleHero} 
                  alt="Premium Nigerian cattle"
                  className="h-full w-full object-cover"
                />
              </div>
              
              {/* Floating Stats Cards */}
              <div className="absolute -left-4 top-8 animate-float rounded-xl bg-white p-4 shadow-strong">
                <div className="text-2xl font-bold text-primary">5,000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              
              <div className="absolute -right-4 bottom-24 animate-float rounded-xl bg-white p-4 shadow-strong" style={{ animationDelay: "1s" }}>
                <div className="text-2xl font-bold text-primary">200+</div>
                <div className="text-sm text-muted-foreground">Verified Farmers</div>
              </div>
              
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 animate-float rounded-xl bg-gold px-6 py-3 shadow-strong" style={{ animationDelay: "0.5s" }}>
                <div className="font-semibold text-white">36 States Covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
