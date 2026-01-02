import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

interface BuyerProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingVendors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBuyers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (user && isAdmin) {
      fetchData();
    }
  }, [user, authLoading, isAdmin, roleLoading, navigate]);

  async function fetchData() {
    try {
      // Fetch all vendors
      const { data: vendorData } = await supabase
        .from("vendors")
        .select("*")
        .order("created_at", { ascending: false });

      setVendors(vendorData || []);

      // Fetch orders
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      setOrders(orderData || []);

      // Fetch buyer profiles with order stats
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, phone, created_at")
        .order("created_at", { ascending: false });

      // Get order counts and totals for each buyer
      const buyerProfiles: BuyerProfile[] = [];
      if (profilesData) {
        for (const profile of profilesData) {
          const { data: userOrders } = await supabase
            .from("orders")
            .select("total, payment_status")
            .eq("user_id", profile.user_id);
          
          const orderCount = userOrders?.length || 0;
          const totalSpent = userOrders
            ?.filter(o => o.payment_status === "paid")
            .reduce((sum, o) => sum + Number(o.total), 0) || 0;

          buyerProfiles.push({
            ...profile,
            order_count: orderCount,
            total_spent: totalSpent,
          });
        }
      }
      setBuyers(buyerProfiles);

      // Calculate stats
      const pendingCount = vendorData?.filter(v => v.status === "pending").length || 0;
      const totalRev = orderData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      setStats({
        totalVendors: vendorData?.length || 0,
        pendingVendors: pendingCount,
        totalOrders: orderData?.length || 0,
        totalRevenue: totalRev,
        totalBuyers: buyerProfiles.length,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateVendorStatus(vendorId: string, status: "approved" | "rejected") {
    try {
      const { error } = await supabase
        .from("vendors")
        .update({ status })
        .eq("id", vendorId);

      if (error) throw error;

      // If approving, add vendor role to user
      if (status === "approved") {
        const vendor = vendors.find(v => v.id === vendorId);
        if (vendor) {
          await supabase
            .from("user_roles")
            .insert({ user_id: vendor.user_id, role: "vendor" });
        }
      }

      toast({
        title: "Vendor Updated",
        description: `Vendor has been ${status}.`,
      });

      fetchData();
    } catch (error) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to update vendor status.",
        variant: "destructive",
      });
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      suspended: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "outline",
      processing: "outline",
      dispatched: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Dashboard | MaluMarket</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Header />
      
      <main className="container py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage vendors, buyers, orders, and platform operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingVendors} pending approval</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuyers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Platform earnings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Vendors</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVendors}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vendors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Applications</CardTitle>
                <CardDescription>Review and manage vendor registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {vendors.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No vendor applications yet</p>
                ) : (
                  <div className="space-y-4">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{vendor.farm_name}</h3>
                            {getStatusBadge(vendor.status)}
                            {vendor.is_verified && (
                              <Badge variant="outline" className="text-primary border-primary">Verified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {vendor.farm_location}, {vendor.lga}, {vendor.state}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {vendor.phone} | Email: {vendor.email || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/vendor/${vendor.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {vendor.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateVendorStatus(vendor.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => updateVendorStatus(vendor.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buyers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Buyers</CardTitle>
                <CardDescription>View and manage platform buyers</CardDescription>
              </CardHeader>
              <CardContent>
                {buyers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No registered buyers yet</p>
                ) : (
                  <div className="space-y-4">
                    {buyers.map((buyer) => (
                      <div key={buyer.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{buyer.full_name || "Name not set"}</h3>
                            {buyer.order_count > 0 && (
                              <Badge variant="default">{buyer.order_count} orders</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {buyer.email || "No email"} | {buyer.phone || "No phone"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Joined: {new Date(buyer.created_at).toLocaleDateString()} | 
                            Total Spent: {formatCurrency(buyer.total_spent)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">{formatCurrency(buyer.total_spent)}</p>
                          <p className="text-sm text-muted-foreground">{buyer.order_count} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>All platform orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            {getOrderStatusBadge(order.status)}
                            <Badge variant={order.payment_status === "paid" ? "default" : "outline"}>
                              {order.payment_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatCurrency(Number(order.total))} | 
                            Created: {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
