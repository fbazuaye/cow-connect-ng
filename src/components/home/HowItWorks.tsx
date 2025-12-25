import { Search, ShoppingCart, Truck, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse & Select",
    description: "Explore our wide selection of healthy, certified cattle from verified farmers across Nigeria. Filter by breed, weight, location, and price.",
  },
  {
    icon: ShoppingCart,
    step: "02",
    title: "Add to Cart & Pay",
    description: "Select your preferred cattle and add them to your cart. Pay securely with Paystack or choose bank transfer. Schedule your delivery date.",
  },
  {
    icon: Truck,
    step: "03",
    title: "Track Delivery",
    description: "Receive real-time updates as your cattle is transported safely to your location. Our delivery partners ensure proper handling throughout.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Receive & Verify",
    description: "Inspect your cattle upon arrival. Confirm delivery and leave a review for the farmer. Enjoy our money-back guarantee if not satisfied.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="container px-4 md:px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Simple Process
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Getting premium cattle delivered to your doorstep has never been easier. Follow these simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary via-primary/50 to-primary/20 lg:block" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className={`relative flex flex-col items-center gap-8 lg:flex-row ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 1 ? "lg:text-right" : ""}`}>
                  <div className={`rounded-2xl border border-border bg-card p-8 shadow-soft transition-all hover:shadow-medium ${
                    index % 2 === 1 ? "lg:ml-auto lg:mr-12" : "lg:mr-auto lg:ml-12"
                  } max-w-md`}>
                    <div className={`mb-4 flex items-center gap-4 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <item.icon className="h-7 w-7" />
                      </div>
                      <span className="font-display text-4xl font-bold text-primary/20">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>

                {/* Center Circle */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary text-lg font-bold text-primary-foreground shadow-lg">
                  {index + 1}
                </div>

                {/* Empty Space for alternating layout */}
                <div className="hidden flex-1 lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
