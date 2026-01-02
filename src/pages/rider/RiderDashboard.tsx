import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRider } from "@/hooks/useRider";
import { supabase } from "@/integrations/supabase/client";
import RiderLayout from "@/components/rider/RiderLayout";
import OnlineToggle from "@/components/rider/OnlineToggle";
import TripCard from "@/components/rider/TripCard";
import PanicButton from "@/components/rider/PanicButton";
import VerificationBadge from "@/components/rider/VerificationBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, TrendingUp, Truck } from "lucide-react";

interface Trip {
  id: string;
  order_id: string;
  delivery_type: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_distance_km: number | null;
  estimated_duration_minutes: number | null;
  rider_earnings: number;
  created_at: string;
}

const RiderDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { rider, wallet, isLoading: riderLoading } = useRider();
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/rider");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!rider) return;

    const fetchTrips = async () => {
      try {
        // Fetch active trips for this rider
        const { data: active } = await supabase
          .from("trips")
          .select("*")
          .eq("rider_id", rider.id)
          .in("status", ["accepted", "picking_up", "picked_up", "in_transit", "arrived"])
          .order("created_at", { ascending: false });

        setActiveTrips((active || []) as Trip[]);

        // Fetch pending trips if rider is verified and online
        if (rider.verification_status === "verified" && rider.is_online) {
          const { data: pending } = await supabase
            .from("trips")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(5);

          setPendingTrips((pending || []) as Trip[]);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsLoadingTrips(false);
      }
    };

    fetchTrips();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("rider-trips")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
        },
        () => {
          fetchTrips();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rider]);

  const handleAcceptTrip = async (tripId: string) => {
    if (!rider) return;

    try {
      const { error } = await supabase
        .from("trips")
        .update({
          rider_id: rider.id,
          status: "accepted",
        })
        .eq("id", tripId)
        .eq("status", "pending");

      if (error) throw error;

      // Refresh trips
      navigate(`/rider/trip/${tripId}`);
    } catch (error) {
      console.error("Error accepting trip:", error);
    }
  };

  if (authLoading || riderLoading) {
    return (
      <RiderLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </RiderLayout>
    );
  }

  if (!rider) {
    return (
      <RiderLayout>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Truck className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Become a MaluMarket Rider</h2>
          <p className="text-muted-foreground mb-6">
            Deliver livestock and earn money on your own schedule.
          </p>
          <Button onClick={() => navigate("/rider/onboarding")}>
            Start Onboarding
          </Button>
        </div>
      </RiderLayout>
    );
  }

  return (
    <RiderLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <VerificationBadge status={rider.verification_status} size="sm" />
          </div>
          <OnlineToggle />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto text-accent mb-1" />
              <p className="text-lg font-bold">{rider.rating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <MapPin className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{rider.total_trips}</p>
              <p className="text-xs text-muted-foreground">Trips</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-green-600 mb-1" />
              <p className="text-lg font-bold">₦{(wallet?.balance || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verification Notice */}
        {rider.verification_status === "pending" && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Verification Pending
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your documents are being reviewed. You'll be able to accept trips once verified.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Active Trips */}
        {activeTrips.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Active Trips</h2>
            <div className="space-y-3">
              {activeTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onViewDetails={() => navigate(`/rider/trip/${trip.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Trips */}
        {rider.verification_status === "verified" && rider.is_online && pendingTrips.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Available Trips</h2>
            <div className="space-y-3">
              {pendingTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onAccept={() => handleAcceptTrip(trip.id)}
                  onViewDetails={() => navigate(`/rider/trip/${trip.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No trips message */}
        {rider.verification_status === "verified" &&
          activeTrips.length === 0 &&
          pendingTrips.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No trips available</h3>
                <p className="text-sm text-muted-foreground">
                  {rider.is_online
                    ? "New delivery requests will appear here."
                    : "Go online to receive delivery requests."}
                </p>
              </CardContent>
            </Card>
          )}
      </div>

      {rider.verification_status === "verified" && <PanicButton />}
    </RiderLayout>
  );
};

export default RiderDashboard;
