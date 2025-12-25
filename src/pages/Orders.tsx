import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  livestock: {
    title: string;
    breed: string;
    images: string[] | null;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  scheduled_delivery_date: string | null;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "bg-blue-100 text-blue-800", label: "Confirmed" },
  processing: { icon: Package, color: "bg-purple-100 text-purple-800", label: "Processing" },
  dispatched: { icon: Truck, color: "bg-indigo-100 text-indigo-800", label: "Dispatched" },
  delivered: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Delivered" },
  cancelled: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Cancelled" },
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            livestock (
              title,
              breed,
              images
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const getStatusStep = (status: string) => {
    const steps = ["pending", "confirmed", "processing", "dispatched", "delivered"];
    return steps.indexOf(status);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders - MalliFarm</title>
        <meta name="description" content="View your order history and track delivery status" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground mt-2">
              Track your orders and view purchase history
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start shopping to see your orders here
                </p>
                <Button onClick={() => navigate("/marketplace")}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const currentStep = getStatusStep(order.status);
                const isCancelled = order.status === "cancelled";

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.order_number}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <Badge className={paymentStatusColors[order.payment_status] || paymentStatusColors.pending}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Order Progress */}
                      {!isCancelled && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            {["Pending", "Confirmed", "Processing", "Dispatched", "Delivered"].map((step, index) => (
                              <div
                                key={step}
                                className={`flex flex-col items-center ${
                                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                    index <= currentStep
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <span className="text-xs mt-1 hidden sm:block">{step}</span>
                              </div>
                            ))}
                          </div>
                          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full bg-primary transition-all duration-500"
                              style={{ width: `${(currentStep / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="space-y-4">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                          >
                            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {item.livestock?.images?.[0] ? (
                                <img
                                  src={item.livestock.images[0]}
                                  alt={item.livestock.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">
                                {item.livestock?.title || "Product Unavailable"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.livestock?.breed || "Unknown breed"} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                {formatPrice(item.total_price)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(item.unit_price)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Delivery Fee</span>
                          <span>{formatPrice(order.delivery_fee)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-primary">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Scheduled Delivery */}
                      {order.scheduled_delivery_date && (
                        <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" />
                          <span className="text-sm">
                            Scheduled delivery: {format(new Date(order.scheduled_delivery_date), "MMMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
