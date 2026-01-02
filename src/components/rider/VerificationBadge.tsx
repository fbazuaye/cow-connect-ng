import { Shield, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending Verification",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  rejected: {
    icon: ShieldAlert,
    label: "Verification Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};

const VerificationBadge = ({ status, size = "md" }: VerificationBadgeProps) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge className={cn(config.className, sizeClasses[size], "inline-flex items-center gap-1")}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  );
};

export default VerificationBadge;
