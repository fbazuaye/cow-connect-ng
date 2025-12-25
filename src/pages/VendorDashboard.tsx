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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Livestock = Database["public"]["Tables"]["livestock"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isVendor, vendorId, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalOrders: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLivestock, setEditingLivestock] = useState<Livestock | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    breed: "",
    price: "",
    weight_kg: "",
    age_months: "",
    description: "",
    health_status: "healthy",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (!roleLoading && !isVendor) {
      toast({
        title: "Access Denied",
        description: "You need to be an approved vendor to access this dashboard.",
        variant: "destructive",
      });
      navigate("/vendor/register");
      return;
    }

    if (user && vendorId) {
      fetchData();
    }
  }, [user, authLoading, isVendor, vendorId, roleLoading, navigate]);

  async function fetchData() {
    if (!vendorId) return;

    try {
      // Fetch vendor's livestock
      const { data: livestockData } = await supabase
        .from("livestock")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      setLivestock(livestockData || []);

      // Fetch vendor's orders
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      setOrders(orderData || []);

      // Calculate stats
      const activeCount = livestockData?.filter(l => l.is_available).length || 0;
      const totalEarn = orderData?.filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.subtotal), 0) || 0;

      setStats({
        totalListings: livestockData?.length || 0,
        activeListings: activeCount,
        totalOrders: orderData?.length || 0,
        totalEarnings: totalEarn,
      });
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddLivestock() {
    if (!vendorId) return;

    try {
      const { error } = await supabase
        .from("livestock")
        .insert({
          vendor_id: vendorId,
          title: formData.title,
          breed: formData.breed,
          price: parseFloat(formData.price),
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          age_months: formData.age_months ? parseInt(formData.age_months) : null,
          description: formData.description,
          health_status: formData.health_status,
          is_available: true,
        });

      if (error) throw error;

      toast({
        title: "Livestock Added",
        description: "Your listing has been created successfully.",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error adding livestock:", error);
      toast({
        title: "Error",
        description: "Failed to add livestock. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleUpdateLivestock() {
    if (!editingLivestock) return;

    try {
      const { error } = await supabase
        .from("livestock")
        .update({
          title: formData.title,
          breed: formData.breed,
          price: parseFloat(formData.price),
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          age_months: formData.age_months ? parseInt(formData.age_months) : null,
          description: formData.description,
          health_status: formData.health_status,
        })
        .eq("id", editingLivestock.id);

      if (error) throw error;

      toast({
        title: "Livestock Updated",
        description: "Your listing has been updated successfully.",
      });

      setEditingLivestock(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error updating livestock:", error);
      toast({
        title: "Error",
        description: "Failed to update livestock. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteLivestock(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const { error } = await supabase
        .from("livestock")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Livestock Deleted",
        description: "Your listing has been removed.",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting livestock:", error);
      toast({
        title: "Error",
        description: "Failed to delete livestock. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function toggleAvailability(item: Livestock) {
    try {
      const { error } = await supabase
        .from("livestock")
        .update({ is_available: !item.is_available })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: item.is_available ? "Listing Hidden" : "Listing Activated",
        description: `Your livestock is now ${item.is_available ? "hidden from" : "visible on"} the marketplace.`,
      });

      fetchData();
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      breed: "",
      price: "",
      weight_kg: "",
      age_months: "",
      description: "",
      health_status: "healthy",
    });
  }

  function openEditDialog(item: Livestock) {
    setFormData({
      title: item.title,
      breed: item.breed,
      price: item.price.toString(),
      weight_kg: item.weight_kg?.toString() || "",
      age_months: item.age_months?.toString() || "",
      description: item.description || "",
      health_status: item.health_status || "healthy",
    });
    setEditingLivestock(item);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
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

  const LivestockForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Premium White Fulani Bull"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            placeholder="e.g., White Fulani"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₦)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="500000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight_kg}
            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
            placeholder="350"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age (months)</Label>
          <Input
            id="age"
            type="number"
            value={formData.age_months}
            onChange={(e) => setFormData({ ...formData, age_months: e.target.value })}
            placeholder="24"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the livestock, health condition, feeding habits, etc."
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Vendor Dashboard | MaluMarket</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Header />
      
      <main className="container py-8 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Vendor Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your livestock listings and orders</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Livestock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Livestock</DialogTitle>
                <DialogDescription>Create a new listing for your livestock</DialogDescription>
              </DialogHeader>
              <LivestockForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddLivestock}>Add Livestock</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalListings}</div>
              <p className="text-xs text-muted-foreground">{stats.activeListings} active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeListings}</div>
              <p className="text-xs text-muted-foreground">Visible on marketplace</p>
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
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">From paid orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="livestock" className="space-y-4">
          <TabsList>
            <TabsTrigger value="livestock">My Livestock</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="livestock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>Manage your livestock inventory</CardDescription>
              </CardHeader>
              <CardContent>
                {livestock.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No livestock listings yet</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Livestock
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {livestock.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.title}</h3>
                            <Badge variant={item.is_available ? "default" : "secondary"}>
                              {item.is_available ? "Active" : "Hidden"}
                            </Badge>
                            {item.is_certified && (
                              <Badge variant="outline" className="text-primary border-primary">Certified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.breed} | {item.weight_kg ? `${item.weight_kg}kg` : "N/A"} | 
                            {item.age_months ? ` ${item.age_months} months` : " Age N/A"}
                          </p>
                          <p className="text-lg font-semibold text-primary">
                            {formatCurrency(Number(item.price))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/livestock/${item.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleAvailability(item)}
                          >
                            {item.is_available ? "Hide" : "Show"}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteLivestock(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>Track customer orders for your livestock</CardDescription>
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
                            <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                              {order.status}
                            </Badge>
                            <Badge variant={order.payment_status === "paid" ? "default" : "outline"}>
                              {order.payment_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Subtotal: {formatCurrency(Number(order.subtotal))} | 
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

        {/* Edit Dialog */}
        <Dialog open={!!editingLivestock} onOpenChange={() => { setEditingLivestock(null); resetForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Livestock</DialogTitle>
              <DialogDescription>Update your livestock listing</DialogDescription>
            </DialogHeader>
            <LivestockForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingLivestock(null); resetForm(); }}>Cancel</Button>
              <Button onClick={handleUpdateLivestock}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
}
