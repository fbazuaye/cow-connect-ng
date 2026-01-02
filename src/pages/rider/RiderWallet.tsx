import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRider } from "@/hooks/useRider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RiderLayout from "@/components/rider/RiderLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, History } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
}

const RiderWallet = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { rider, wallet, isLoading: riderLoading } = useRider();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/rider/wallet");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!wallet) return;

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("wallet_id", wallet.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        setTransactions((data || []) as Transaction[]);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [wallet]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!wallet || amount > wallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      // Create withdrawal transaction
      const { error: txError } = await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        type: "withdrawal",
        amount: -amount,
        description: "Withdrawal to bank account",
        status: "pending",
      });

      if (txError) throw txError;

      toast({
        title: "Withdrawal Requested",
        description: `₦${amount.toLocaleString()} withdrawal is being processed`,
      });

      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (authLoading || riderLoading) {
    return (
      <RiderLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </RiderLayout>
    );
  }

  if (!rider || !wallet) {
    navigate("/rider/onboarding");
    return null;
  }

  return (
    <RiderLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">Wallet</h1>

        {/* Balance Card */}
        <Card className="gradient-hero text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm opacity-90">Available Balance</span>
            </div>
            <p className="text-3xl font-bold">₦{wallet.balance.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <ArrowDownLeft className="h-4 w-4" />
                <span className="text-sm">Total Earned</span>
              </div>
              <p className="text-xl font-bold">₦{wallet.total_earned.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm">Withdrawn</span>
              </div>
              <p className="text-xl font-bold">₦{wallet.total_withdrawn.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Withdraw Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Withdraw Funds</CardTitle>
            <CardDescription>Transfer to your bank account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              disabled={isWithdrawing || !withdrawAmount}
              onClick={handleWithdraw}
            >
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </Button>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === "earning" || tx.type === "bonus"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {tx.type === "earning" || tx.type === "bonus" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-semibold ${
                          tx.amount > 0 ? "text-green-600" : "text-foreground"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}₦{Math.abs(tx.amount).toLocaleString()}
                      </p>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RiderLayout>
  );
};

export default RiderWallet;
