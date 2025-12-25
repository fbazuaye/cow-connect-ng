import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Alhaji Musa Ibrahim",
    role: "Restaurant Owner, Lagos",
    content: "MaluMarket transformed how I source cattle for my suya business. The quality is consistent, and delivery is always on time. I've been using them for 2 years now.",
    rating: 5,
    image: null,
  },
  {
    name: "Mrs. Chioma Okonkwo",
    role: "Event Planner, Abuja",
    content: "For every traditional wedding I plan, I trust MaluMarket for the cattle. The health certificates give my clients peace of mind. Highly recommended!",
    rating: 5,
    image: null,
  },
  {
    name: "Mallam Usman Abdullahi",
    role: "Farmer, Kano",
    content: "As a vendor on MaluMarket, I've expanded my customer base beyond my local market. The platform is easy to use and payments are always prompt.",
    rating: 5,
    image: null,
  },
  {
    name: "Chief Emeka Nwosu",
    role: "Traditional Ruler, Anambra",
    content: "The quality of cattle I receive from MaluMarket for our community celebrations is unmatched. Their customer service is exceptional.",
    rating: 5,
    image: null,
  },
  {
    name: "Hajiya Fatima Bello",
    role: "Wholesaler, Kaduna",
    content: "I purchase large quantities regularly and MaluMarket handles everything professionally. The money-back guarantee gave me confidence to try them.",
    rating: 5,
    image: null,
  },
  {
    name: "Mr. Adebayo Johnson",
    role: "Butcher, Ibadan",
    content: "Fresh, healthy cattle delivered right to my shop. The tracking feature lets me know exactly when to expect delivery. Game changer for my business!",
    rating: 5,
    image: null,
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted py-20 lg:py-28">
      <div className="container px-4 md:px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Customer Stories
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Trusted by Thousands
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Don't just take our word for it. See what our customers across Nigeria have to say about MaluMarket.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-medium"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/10" />
              
              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>

              {/* Content */}
              <p className="mb-6 text-muted-foreground">"{testimonial.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {testimonial.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
