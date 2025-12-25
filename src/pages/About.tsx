import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, Users, MapPin, Award } from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - MaluMarket | Nigeria's Trusted Livestock Marketplace</title>
        <meta name="description" content="Learn about MaluMarket - Nigeria's premier online marketplace connecting cattle farmers with buyers. Our mission, values, and commitment to quality livestock trade." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-primary/5 py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  About MaluMarket
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Connecting Nigeria's cattle farmers with buyers through a trusted, 
                  transparent, and modern digital marketplace.
                </p>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                    <p className="text-muted-foreground mb-4">
                      At MaluMarket, we're revolutionizing how Nigerians buy and sell cattle. 
                      Our platform bridges the gap between rural farmers and urban buyers, 
                      creating opportunities for both to thrive.
                    </p>
                    <p className="text-muted-foreground">
                      We believe in fair trade, transparency, and quality assurance. Every 
                      animal listed on our platform is verified, and every transaction is 
                      protected by our buyer guarantee.
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-2xl p-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-foreground">Trust & Security</h3>
                          <p className="text-sm text-muted-foreground">Verified vendors and secure transactions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Users className="w-8 h-8 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-foreground">Community First</h3>
                          <p className="text-sm text-muted-foreground">Supporting local farmers across Nigeria</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Award className="w-8 h-8 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-foreground">Quality Assured</h3>
                          <p className="text-sm text-muted-foreground">Health-certified livestock only</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-secondary/50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                  MaluMarket in Numbers
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">500+</div>
                    <div className="text-muted-foreground">Verified Vendors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">36</div>
                    <div className="text-muted-foreground">States Covered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                    <div className="text-muted-foreground">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">98%</div>
                    <div className="text-muted-foreground">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Coverage Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Nationwide Coverage
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  From Sokoto to Lagos, Borno to Rivers, MaluMarket connects buyers 
                  with quality cattle vendors across all 36 states of Nigeria and the FCT. 
                  Our network of verified farmers ensures you can find the perfect livestock 
                  no matter where you are.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
