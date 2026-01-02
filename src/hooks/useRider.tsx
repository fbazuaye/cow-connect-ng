import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { Json } from "@/integrations/supabase/types";

interface Rider {
  id: string;
  user_id: string;
  phone: string;
  id_document_url: string | null;
  selfie_url: string | null;
  verification_status: string;
  is_online: boolean;
  current_location: Json | null;
  rating: number;
  total_trips: number;
  total_reviews: number;
  compliance_score: number;
}

interface Vehicle {
  id: string;
  rider_id: string;
  vehicle_type: string;
  plate_number: string;
  model: string | null;
  color: string | null;
  capacity_kg: number | null;
  is_active: boolean;
}

interface Wallet {
  id: string;
  rider_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface RiderContextType {
  rider: Rider | null;
  vehicles: Vehicle[];
  wallet: Wallet | null;
  isLoading: boolean;
  isOnline: boolean;
  toggleOnlineStatus: () => Promise<void>;
  refreshRider: () => Promise<void>;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const RiderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rider, setRider] = useState<Rider | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRiderData = async () => {
    if (!user) {
      setRider(null);
      setVehicles([]);
      setWallet(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch rider profile
      const { data: riderData, error: riderError } = await supabase
        .from("riders")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (riderError) throw riderError;

      if (riderData) {
        setRider(riderData as Rider);

        // Fetch vehicles
        const { data: vehiclesData } = await supabase
          .from("vehicles")
          .select("*")
          .eq("rider_id", riderData.id);

        setVehicles((vehiclesData || []) as Vehicle[]);

        // Fetch wallet
        const { data: walletData } = await supabase
          .from("rider_wallets")
          .select("*")
          .eq("rider_id", riderData.id)
          .maybeSingle();

        setWallet(walletData as Wallet | null);
      }
    } catch (error) {
      console.error("Error fetching rider data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!rider) return;

    const newStatus = !rider.is_online;

    try {
      const { error } = await supabase
        .from("riders")
        .update({ is_online: newStatus })
        .eq("id", rider.id);

      if (error) throw error;

      setRider((prev) => (prev ? { ...prev, is_online: newStatus } : null));

      toast({
        title: newStatus ? "You're now online" : "You're now offline",
        description: newStatus
          ? "You can receive delivery requests"
          : "You won't receive new requests",
      });
    } catch (error) {
      console.error("Error toggling online status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRiderData();
  }, [user]);

  return (
    <RiderContext.Provider
      value={{
        rider,
        vehicles,
        wallet,
        isLoading,
        isOnline: rider?.is_online || false,
        toggleOnlineStatus,
        refreshRider: fetchRiderData,
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => {
  const context = useContext(RiderContext);
  if (context === undefined) {
    throw new Error("useRider must be used within a RiderProvider");
  }
  return context;
};
