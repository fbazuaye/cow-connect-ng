import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRider } from "@/hooks/useRider";
import { supabase } from "@/integrations/supabase/client";
import RiderLayout from "@/components/rider/RiderLayout";
import TripCard from "@/components/rider/TripCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

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

const RiderTrips = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { rider, isLoading: riderLoading } = useRider();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/rider/trips");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!rider) return;

    const fetchTrips = async () => {
      try {
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("rider_id", rider.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTrips((data || []) as Trip[]);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [rider]);

  const activeTrips = trips.filter((t) =>
    ["accepted", "picking_up", "picked_up", "in_transit", "arrived"].includes(t.status)
  );

  const completedTrips = trips.filter((t) => t.status === "delivered");
  const cancelledTrips = trips.filter((t) => t.status === "cancelled");

  if (authLoading || riderLoading) {
    return (
      <RiderLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </RiderLayout>
    );
  }

  if (!rider) {
    navigate("/rider/onboarding");
    return null;
  }

  const renderTrips = (tripList: Trip[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      );
    }

    if (tripList.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {tripList.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onViewDetails={() => navigate(`/rider/trip/${trip.id}`)}
          />
        ))}
      </div>
    );
  };

  return (
    <RiderLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">My Trips</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="active" className="flex-1">
              Active ({activeTrips.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed ({completedTrips.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1">
              Cancelled ({cancelledTrips.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {renderTrips(activeTrips, "No active trips")}
          </TabsContent>

          <TabsContent value="completed">
            {renderTrips(completedTrips, "No completed trips yet")}
          </TabsContent>

          <TabsContent value="cancelled">
            {renderTrips(cancelledTrips, "No cancelled trips")}
          </TabsContent>
        </Tabs>
      </div>
    </RiderLayout>
  );
};

export default RiderTrips;
