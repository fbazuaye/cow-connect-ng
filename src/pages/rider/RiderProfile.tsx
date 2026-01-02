import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRider } from "@/hooks/useRider";
import RiderLayout from "@/components/rider/RiderLayout";
import VerificationBadge from "@/components/rider/VerificationBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Phone,
  Truck,
  Star,
  MapPin,
  Shield,
  LogOut,
  ChevronRight,
  Settings,
} from "lucide-react";

const RiderProfile = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { rider, vehicles, isLoading: riderLoading } = useRider();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || riderLoading) {
    return (
      <RiderLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full" />
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

  const vehicle = vehicles.find((v) => v.is_active);

  return (
    <RiderLayout>
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user?.email?.[0].toUpperCase() || "R"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user?.email?.split("@")[0]}</h2>
                <VerificationBadge status={rider.verification_status} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              <div>
                <p className="text-2xl font-bold">{rider.rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Star className="h-3 w-3" /> Rating
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">{rider.total_trips}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" /> Trips
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">{rider.compliance_score}%</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" /> Score
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{rider.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        {vehicle && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">
                    {vehicle.vehicle_type.replace("_", " ")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plate Number</span>
                  <span className="font-medium">{vehicle.plate_number}</span>
                </div>
                {vehicle.model && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">{vehicle.model}</span>
                    </div>
                  </>
                )}
                {vehicle.color && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color</span>
                      <span className="font-medium">{vehicle.color}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => navigate("/rider/incidents")}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Incident History</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <Separator />
            <button
              onClick={() => navigate("/rider/settings")}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span>Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </RiderLayout>
  );
};

export default RiderProfile;
