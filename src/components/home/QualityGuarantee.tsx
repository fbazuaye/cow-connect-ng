import { Link } from "react-router-dom";
import { Shield, FileCheck, Stethoscope, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const guarantees = [
  {
    icon: FileCheck,
    title: "Health Certificates",
    description: "Every cattle comes with up-to-date health certificates and vaccination records from certified veterinarians.",
  },
  {
    icon: Stethoscope,
    title: "Vet Inspection",
    description: "All livestock undergo thorough veterinary inspection before listing to ensure they are healthy and disease-free.",
  },
  {
    icon: Shield,
    title: "Insurance Coverage",
    description: "Your purchase is protected during transit. Any issues during delivery are fully covered by our insurance.",
  },
  {
    icon: RefreshCw,
    title: "24-Hour Guarantee",
    description: "Not satisfied with your cattle? Request a full refund within 24 hours of delivery. No questions asked.",
  },
];

export function QualityGuarantee() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-earth to-earth-dark" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container relative px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="text-center lg:text-left">
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
              Our Promise
            </span>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Quality You Can <span className="text-gold">Trust</span>
            </h2>
            <p className="mt-6 text-lg text-white/80">
              We understand that purchasing live cattle is a significant investment. That's why we've implemented rigorous quality standards to ensure you receive only the best.
            </p>
            
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" asChild className="bg-gold text-foreground hover:bg-gold-light">
                <Link to="/marketplace">Shop with Confidence</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/quality">Learn More</Link>
              </Button>
            </div>
          </div>

          {/* Guarantee Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {guarantees.map((item, index) => (
              <div
                key={item.title}
                className="rounded-xl bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gold text-foreground">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
