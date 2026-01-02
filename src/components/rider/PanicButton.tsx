import { useState } from "react";
import { AlertTriangle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useRider } from "@/hooks/useRider";
import { useToast } from "@/hooks/use-toast";

interface PanicButtonProps {
  tripId?: string;
}

const incidentTypes = [
  { value: "panic", label: "Emergency / Panic" },
  { value: "accident", label: "Accident" },
  { value: "breakdown", label: "Vehicle Breakdown" },
  { value: "other", label: "Other Issue" },
];

const PanicButton = ({ tripId }: PanicButtonProps) => {
  const { rider } = useRider();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidentType, setIncidentType] = useState("panic");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!rider) return;

    setIsSubmitting(true);

    try {
      // Get current location
      let location = null;
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        }).catch(() => null);

        if (position) {
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        }
      }

      const { error } = await supabase.from("incidents").insert({
        rider_id: rider.id,
        trip_id: tripId || null,
        type: incidentType,
        description: description || null,
        location,
      });

      if (error) throw error;

      toast({
        title: "Incident Reported",
        description: "Our support team has been notified and will contact you shortly.",
      });

      setIsOpen(false);
      setDescription("");
      setIncidentType("panic");
    } catch (error) {
      console.error("Error reporting incident:", error);
      toast({
        title: "Error",
        description: "Failed to report incident. Please try again or call support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <AlertTriangle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Report Incident
            </DialogTitle>
            <DialogDescription>
              Report an emergency or issue. Our support team will be notified immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Type of Incident</Label>
              <RadioGroup
                value={incidentType}
                onValueChange={setIncidentType}
                className="mt-2 space-y-2"
              >
                {incidentTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Reporting..." : "Report Incident"}
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+2348000000000" className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call Emergency Support
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PanicButton;
