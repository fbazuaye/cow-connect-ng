import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      if (!user) {
        setRoles([]);
        setVendorId(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch user roles
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (roleError) throw roleError;
        
        const userRoles = roleData?.map((r) => r.role) || [];
        setRoles(userRoles);

        // If user is a vendor, fetch their vendor ID
        if (userRoles.includes("vendor")) {
          const { data: vendorData } = await supabase
            .from("vendors")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "approved")
            .maybeSingle();
          
          setVendorId(vendorData?.id || null);
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, [user]);

  const isAdmin = roles.includes("admin");
  const isVendor = roles.includes("vendor");
  const isBuyer = roles.includes("buyer");

  return { roles, isAdmin, isVendor, isBuyer, vendorId, loading };
}
