import { Shield, Truck, Award, HeartHandshake, Clock, BadgeCheck } from "lucide-react";

const indicators = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Pay safely with Paystack or bank transfer. Your money is protected.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Farmers",
    description: "All vendors are vetted and verified for quality assurance.",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "We deliver to all 36 states in Nigeria, safely and on time.",
  },
  {
    icon: Award,
    title: "Health Certified",
    description: "All cattle come with health certificates and vaccination records.",
  },
  {
    icon: HeartHandshake,
    title: "Money-Back Guarantee",
    description: "Not satisfied? Get a full refund within 24 hours of delivery.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our customer service team is always ready to help you.",
  },
];

export function TrustIndicators() {
  return (
    <section className="border-y border-border bg-cream py-16">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Why Choose <span className="text-primary">MooMarket?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We've built Nigeria's most trusted livestock marketplace with your peace of mind as our priority.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {indicators.map((indicator, index) => (
            <div
              key={indicator.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-medium"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <indicator.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                {indicator.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {indicator.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
