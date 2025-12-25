import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Store, CheckCircle } from "lucide-react";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Abuja"
];

export default function VendorRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    farmName: "", farmLocation: "", state: "", phone: "", email: "", description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      navigate("/auth?mode=signup");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("vendors").insert({
        user_id: user.id,
        farm_name: formData.farmName,
        farm_location: formData.farmLocation,
        state: formData.state,
        phone: formData.phone,
        email: formData.email || user.email,
        description: formData.description,
      });

      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Application submitted!", description: "We'll review and get back to you soon." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-muted px-4 py-12">
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-primary" />
            <h1 className="font-display text-3xl font-bold">Application Submitted!</h1>
            <p className="text-muted-foreground">We'll review your application and contact you shortly.</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted px-4 py-12">
        <div className="container max-w-2xl">
          <div className="mb-8 text-center">
            <Store className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 font-display text-3xl font-bold">Become a Vendor</h1>
            <p className="mt-2 text-muted-foreground">Sell your livestock to customers across Nigeria</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-8 shadow-soft">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input id="farmName" required value={formData.farmName} onChange={(e) => setFormData({ ...formData, farmName: e.target.value })} placeholder="Your farm name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+234..." />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>{NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contact@farm.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmLocation">Farm Address *</Label>
              <Input id="farmLocation" required value={formData.farmLocation} onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })} placeholder="Full address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Your Farm</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tell us about your farm..." rows={4} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
