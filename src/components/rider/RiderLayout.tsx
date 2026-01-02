import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MapPin, Wallet, User, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiderLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/rider", icon: Home, label: "Home" },
  { path: "/rider/trips", icon: MapPin, label: "Trips" },
  { path: "/rider/wallet", icon: Wallet, label: "Wallet" },
  { path: "/rider/profile", icon: User, label: "Profile" },
];

const RiderLayout = ({ children }: RiderLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default RiderLayout;
