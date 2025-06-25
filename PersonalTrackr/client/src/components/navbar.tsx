import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, LogOut, Users, ChefHat, Shield } from "lucide-react";
import { UserRole } from "@shared/schema";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="h-4 w-4" />;
      case UserRole.ATENDENTE:
        return <Users className="h-4 w-4" />;
      case UserRole.COZINHA:
        return <ChefHat className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrador";
      case UserRole.ATENDENTE:
        return "Atendente";
      case UserRole.COZINHA:
        return "Cozinha";
      default:
        return role;
    }
  };

  const getNavigationItems = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return [
          { path: "/admin", label: "Dashboard", active: location === "/admin" },
        ];
      case UserRole.ATENDENTE:
        return [
          { path: "/atendente", label: "Mesas", active: location.startsWith("/atendente") || location === "/" },
        ];
      case UserRole.COZINHA:
        return [
          { path: "/kitchen", label: "Pedidos", active: location === "/kitchen" },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems(user.role);

  return (
    <nav className="bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Utensils className="h-8 w-8 text-white mr-3" />
              <span className="text-white text-xl font-bold">RestaurantePOS</span>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "text-accent bg-white/10"
                      : "text-white hover:text-accent hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white">{user.name}</span>
            <Badge variant="secondary" className="flex items-center space-x-1">
              {getRoleIcon(user.role)}
              <span>{getRoleLabel(user.role)}</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:text-accent hover:bg-white/10"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
