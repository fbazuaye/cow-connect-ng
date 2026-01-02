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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  Bike,
  Star,
  MapPin,
  Phone,
  FileText,
  AlertTriangle
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type Rider = Database["public"]["Tables"]["riders"]["Row"];

interface BuyerProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

interface RiderWithProfile extends Rider {
  profile?: {
    full_name: string | null;
    email: string | null;
  };
  active_trips?: number;
  completed_trips?: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
  const [riders, setRiders] = useState<RiderWithProfile[]>([]);
  const [selectedRider, setSelectedRider] = useState<RiderWithProfile | null>(null);
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingVendors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBuyers: 0,
    totalRiders: 0,
    pendingRiders: 0,
    activeRiders: 0,
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

      // Fetch riders
      const { data: riderData } = await supabase
        .from("riders")
        .select("*")
        .order("created_at", { ascending: false });

      // Enrich rider data with profiles and trip counts
      const enrichedRiders: RiderWithProfile[] = [];
      if (riderData) {
        for (const rider of riderData) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", rider.user_id)
            .maybeSingle();

          const { count: activeCount } = await supabase
            .from("trips")
            .select("*", { count: "exact", head: true })
            .eq("rider_id", rider.id)
            .in("status", ["assigned", "accepted", "picking_up", "picked_up", "in_transit", "arrived"]);

          const { count: completedCount } = await supabase
            .from("trips")
            .select("*", { count: "exact", head: true })
            .eq("rider_id", rider.id)
            .eq("status", "delivered");

          enrichedRiders.push({
            ...rider,
            profile: profile || undefined,
            active_trips: activeCount || 0,
            completed_trips: completedCount || 0,
          });
        }
      }
      setRiders(enrichedRiders);

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
      const pendingVendorCount = vendorData?.filter(v => v.status === "pending").length || 0;
      const totalRev = orderData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const pendingRiderCount = riderData?.filter(r => r.verification_status === "pending").length || 0;
      const activeRiderCount = riderData?.filter(r => r.is_online).length || 0;

      setStats({
        totalVendors: vendorData?.length || 0,
        pendingVendors: pendingVendorCount,
        totalOrders: orderData?.length || 0,
        totalRevenue: totalRev,
        totalBuyers: buyerProfiles.length,
        totalRiders: riderData?.length || 0,
        pendingRiders: pendingRiderCount,
        activeRiders: activeRiderCount,
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

  async function updateRiderStatus(riderId: string, status: "verified" | "rejected") {
    try {
      const { error } = await supabase
        .from("riders")
        .update({ verification_status: status })
        .eq("id", riderId);

      if (error) throw error;

      // If approving, add rider role to user
      if (status === "verified") {
        const rider = riders.find(r => r.id === riderId);
        if (rider) {
          // Check if role already exists
          const { data: existingRole } = await supabase
            .from("user_roles")
            .select("id")
            .eq("user_id", rider.user_id)
            .eq("role", "rider")
            .maybeSingle();

          if (!existingRole) {
            await supabase
              .from("user_roles")
              .insert({ user_id: rider.user_id, role: "rider" });
          }
        }
      }

      toast({
        title: "Rider Updated",
        description: `Rider has been ${status}.`,
      });

      setSelectedRider(null);
      fetchData();
    } catch (error) {
      console.error("Error updating rider:", error);
      toast({
        title: "Error",
        description: "Failed to update rider status.",
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

  const getRiderStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending Verification" },
      verified: { variant: "default", label: "Verified" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const { variant, label } = config[status] || { variant: "outline", label: status };
    return <Badge variant={variant}>{label}</Badge>;
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
          <p className="text-muted-foreground mt-1">Manage vendors, buyers, riders, orders, and platform operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingVendors} pending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Buyers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuyers}</div>
              <p className="text-xs text-muted-foreground">Registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Riders</CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRiders}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingRiders} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Riders</CardTitle>
              <MapPin className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeRiders}</div>
              <p className="text-xs text-muted-foreground">Online now</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Platform</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVendors}</div>
              <p className="text-xs text-muted-foreground">Vendors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingRiders}</div>
              <p className="text-xs text-muted-foreground">Riders</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vendors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="riders" className="relative">
              Riders
              {stats.pendingRiders > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats.pendingRiders}
                </span>
              )}
            </TabsTrigger>
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

          <TabsContent value="riders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rider Management</CardTitle>
                <CardDescription>Review rider applications and monitor delivery personnel</CardDescription>
              </CardHeader>
              <CardContent>
                {riders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No rider applications yet</p>
                ) : (
                  <div className="space-y-4">
                    {riders.map((rider) => (
                      <div key={rider.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{rider.profile?.full_name || "Name not set"}</h3>
                            {getRiderStatusBadge(rider.verification_status)}
                            {rider.is_online && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                                Online
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {rider.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {Number(rider.rating).toFixed(1)} ({rider.total_reviews} reviews)
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {rider.total_trips} total trips
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rider.profile?.email || "No email"} | Compliance: {Number(rider.compliance_score).toFixed(0)}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRider(rider)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          {rider.verification_status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateRiderStatus(rider.id, "verified")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => updateRiderStatus(rider.id, "rejected")}
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

      {/* Rider Detail Dialog */}
      <Dialog open={!!selectedRider} onOpenChange={() => setSelectedRider(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rider Details</DialogTitle>
            <DialogDescription>
              Review rider information and verification documents
            </DialogDescription>
          </DialogHeader>
          
          {selectedRider && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedRider.profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="font-semibold">{selectedRider.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedRider.profile?.email || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getRiderStatusBadge(selectedRider.verification_status)}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{selectedRider.total_trips}</p>
                    <p className="text-xs text-muted-foreground">Total Trips</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{Number(selectedRider.rating).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{selectedRider.active_trips}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{Number(selectedRider.compliance_score).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Compliance</p>
                  </CardContent>
                </Card>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Verification Documents
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">ID Document</p>
                    {selectedRider.id_document_url ? (
                      <a 
                        href={selectedRider.id_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View Document →
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not uploaded</p>
                    )}
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Selfie Photo</p>
                    {selectedRider.selfie_url ? (
                      <a 
                        href={selectedRider.selfie_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View Photo →
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedRider.verification_status === "pending" && (
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button 
                    variant="destructive"
                    onClick={() => updateRiderStatus(selectedRider.id, "rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                  <Button 
                    onClick={() => updateRiderStatus(selectedRider.id, "verified")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Verify
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
