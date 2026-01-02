import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  ShoppingCart, 
  MapPin, 
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  ChevronRight,
  Plus,
  User
} from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
}

interface Address {
  id: string;
  label: string;
  full_address: string;
  city: string | null;
  state: string;
  phone: string;
  is_default: boolean | null;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  async function fetchData() {
    try {
      // Fetch orders
      const { data: orderData } = await supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setOrders(orderData || []);

      // Fetch all orders for stats
      const { data: allOrders } = await supabase
        .from("orders")
        .select("status, total, payment_status")
        .eq("user_id", user?.id);

      // Fetch addresses
      const { data: addressData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false });

      setAddresses(addressData || []);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("user_id", user?.id)
        .maybeSingle();

      setProfile(profileData);

      // Calculate stats
      const pending = allOrders?.filter(o => 
        ["pending", "confirmed", "processing", "dispatched"].includes(o.status)
      ).length || 0;
      const delivered = allOrders?.filter(o => o.status === "delivered").length || 0;
      const totalSpent = allOrders?.filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.total), 0) || 0;

      setStats({
        totalOrders: allOrders?.length || 0,
        pendingOrders: pending,
        deliveredOrders: delivered,
        totalSpent,
      });
    } catch (error) {
      console.error("Error fetching buyer data:", error);
    } finally {
      setLoading(false);
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
      confirmed: "outline",
      processing: "outline",
      dispatched: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (authLoading || loading) {
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
        <title>My Dashboard | MaluMarket</title>
        <meta name="description" content="Manage your orders, addresses, and profile" />
      </Helmet>
      
      <Header />
      
      <main className="container py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">Manage your orders, addresses, and account</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Lifetime orders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">Completed orders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">Lifetime purchases</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="addresses">My Addresses</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/orders">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button asChild>
                      <Link to="/marketplace">Browse Marketplace</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "MMM d, yyyy")} • {formatCurrency(Number(order.total))}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/orders">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>Manage your delivery addresses</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No addresses saved yet</p>
                    <p className="text-sm text-muted-foreground">
                      Addresses will be saved when you place an order
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div key={address.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{address.label}</span>
                          {address.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{address.full_address}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.city && `${address.city}, `}{address.state}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {profile?.full_name || "Name not set"}
                      </h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-medium">{profile?.email || user?.email || "Not set"}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium">{profile?.phone || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}