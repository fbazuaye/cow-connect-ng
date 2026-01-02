import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRider } from "@/hooks/useRider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RiderLayout from "@/components/rider/RiderLayout";
import PanicButton from "@/components/rider/PanicButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Navigation,
  Phone,
  Camera,
  Check,
  ChevronLeft,
  Package,
  Clock,
  DollarSign,
} from "lucide-react";

interface Trip {
  id: string;
  order_id: string;
  delivery_type: string;
  status: string;
  pickup_address: string;
  pickup_coordinates: { lat: number; lng: number } | null;
  dropoff_address: string;
  dropoff_coordinates: { lat: number; lng: number } | null;
  pickup_notes: string | null;
  delivery_notes: string | null;
  estimated_distance_km: number | null;
  estimated_duration_minutes: number | null;
  rider_earnings: number;
  created_at: string;
}

const statusFlow = [
  { key: "accepted", label: "Accepted", next: "picking_up", action: "Start Pickup" },
  { key: "picking_up", label: "Going to Pickup", next: "picked_up", action: "Confirm Pickup" },
  { key: "picked_up", label: "Picked Up", next: "in_transit", action: "Start Delivery" },
  { key: "in_transit", label: "In Transit", next: "arrived", action: "Arrived" },
  { key: "arrived", label: "Arrived", next: "delivered", action: "Complete Delivery" },
  { key: "delivered", label: "Delivered", next: null, action: null },
];

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rider } = useRider();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationPhoto, setVerificationPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTrip = async () => {
      try {
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setTrip(data as Trip);
      } catch (error) {
        console.error("Error fetching trip:", error);
        toast({
          title: "Error",
          description: "Failed to load trip details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`trip-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setTrip(payload.new as Trip);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, toast]);

  const getCurrentStatusInfo = () => {
    return statusFlow.find((s) => s.key === trip?.status);
  };

  const handleUpdateStatus = async (requiresVerification = false) => {
    if (!trip || !rider) return;

    const statusInfo = getCurrentStatusInfo();
    if (!statusInfo?.next) return;

    if (requiresVerification && !showVerification) {
      setShowVerification(true);
      return;
    }

    setIsUpdating(true);

    try {
      const updateData: Record<string, unknown> = {
        status: statusInfo.next,
      };

      // Add timestamps for specific statuses
      if (statusInfo.next === "picked_up") {
        updateData.pickup_time = new Date().toISOString();
        updateData.pickup_notes = verificationNotes || null;
      } else if (statusInfo.next === "delivered") {
        updateData.delivery_time = new Date().toISOString();
        updateData.delivery_notes = verificationNotes || null;
      }

      const { error } = await supabase
        .from("trips")
        .update(updateData)
        .eq("id", trip.id);

      if (error) throw error;

      // Update order status if delivered
      if (statusInfo.next === "delivered") {
        await supabase
          .from("orders")
          .update({ status: "delivered" })
          .eq("id", trip.order_id);

        toast({
          title: "Delivery Completed! 🎉",
          description: `You earned ₦${trip.rider_earnings.toLocaleString()}`,
        });
      } else {
        toast({
          title: "Status Updated",
          description: `Trip is now ${statusInfo.next.replace("_", " ")}`,
        });
      }

      setShowVerification(false);
      setVerificationNotes("");
      setVerificationPhoto(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update trip status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openNavigation = (address: string, coords?: { lat: number; lng: number } | null) => {
    if (coords) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
        "_blank"
      );
    }
  };

  if (isLoading) {
    return (
      <RiderLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </RiderLayout>
    );
  }

  if (!trip) {
    return (
      <RiderLayout>
        <div className="p-4 text-center">
          <p>Trip not found</p>
          <Button onClick={() => navigate("/rider/trips")} className="mt-4">
            Back to Trips
          </Button>
        </div>
      </RiderLayout>
    );
  }

  const statusInfo = getCurrentStatusInfo();
  const isPickupPhase = ["accepted", "picking_up"].includes(trip.status);
  const isDeliveryPhase = ["picked_up", "in_transit", "arrived"].includes(trip.status);
  const requiresVerification = ["picking_up", "arrived"].includes(trip.status);

  return (
    <RiderLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/rider/trips")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Trip Details</h1>
            <Badge className="mt-1 capitalize">
              {trip.status.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Trip Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              {trip.delivery_type.replace("_", " ").toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {trip.estimated_distance_km?.toFixed(1) || "—"} km
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {trip.estimated_duration_minutes || "—"} min
              </span>
              <span className="flex items-center gap-1 font-semibold text-primary">
                ₦{trip.rider_earnings.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pickup Location */}
        <Card className={isPickupPhase ? "border-primary" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">{trip.pickup_address}</p>
            {isPickupPhase && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNavigation(trip.pickup_address, trip.pickup_coordinates)}
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Pickup
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Dropoff Location */}
        <Card className={isDeliveryPhase ? "border-primary" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Delivery Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">{trip.dropoff_address}</p>
            {isDeliveryPhase && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNavigation(trip.dropoff_address, trip.dropoff_coordinates)}
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Delivery
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        {statusInfo?.action && trip.status !== "delivered" && (
          <Button
            className="w-full h-14 text-lg"
            onClick={() => handleUpdateStatus(requiresVerification)}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : statusInfo.action}
          </Button>
        )}

        {/* Completed Message */}
        {trip.status === "delivered" && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-500">
            <CardContent className="p-6 text-center">
              <Check className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Delivery Completed!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                You earned ₦{trip.rider_earnings.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {trip.status === "picking_up" ? "Confirm Pickup" : "Complete Delivery"}
            </DialogTitle>
            <DialogDescription>
              {trip.status === "picking_up"
                ? "Verify that you have collected the livestock"
                : "Verify delivery with photo and signature"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Any observations or notes..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleUpdateStatus(false)}
              disabled={isUpdating}
            >
              {isUpdating ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {trip.status !== "delivered" && trip.status !== "cancelled" && (
        <PanicButton tripId={trip.id} />
      )}
    </RiderLayout>
  );
};

export default TripDetail;
