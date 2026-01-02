import { MapPin, Package, Clock, DollarSign, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface TripCardProps {
  trip: Trip;
  onAccept?: () => void;
  onViewDetails?: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  picking_up: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  picked_up: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  in_transit: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  arrived: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const TripCard = ({ trip, onAccept, onViewDetails }: TripCardProps) => {
  const isPending = trip.status === "pending";
  const isActive = ["accepted", "picking_up", "picked_up", "in_transit", "arrived"].includes(trip.status);

  return (
    <Card className={cn("transition-all", isActive && "border-primary shadow-medium")}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium capitalize">
              {trip.delivery_type.replace("_", " ")}
            </span>
          </div>
          <Badge className={cn("text-xs", statusColors[trip.status])}>
            {trip.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm line-clamp-1">{trip.pickup_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Dropoff</p>
              <p className="text-sm line-clamp-1">{trip.dropoff_address}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{trip.estimated_distance_km?.toFixed(1) || "—"} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{trip.estimated_duration_minutes || "—"} min</span>
          </div>
          <div className="flex items-center gap-1 text-primary font-semibold">
            <span>₦{trip.rider_earnings.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isPending && onAccept && (
            <Button onClick={onAccept} className="flex-1">
              Accept Trip
            </Button>
          )}
          <Button
            variant={isPending ? "outline" : "default"}
            onClick={onViewDetails}
            className={cn(!isPending && "flex-1")}
          >
            {isActive ? "View Details" : "Details"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
