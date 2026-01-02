import { useRider } from "@/hooks/useRider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const OnlineToggle = () => {
  const { isOnline, toggleOnlineStatus, rider } = useRider();

  if (!rider || rider.verification_status !== "verified") {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-3 h-3 rounded-full transition-colors",
          isOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
        )}
      />
      <span className={cn("text-sm font-medium", isOnline ? "text-green-600" : "text-muted-foreground")}>
        {isOnline ? "Online" : "Offline"}
      </span>
      <Switch checked={isOnline} onCheckedChange={toggleOnlineStatus} />
    </div>
  );
};

export default OnlineToggle;
