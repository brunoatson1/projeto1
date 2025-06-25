import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import Navbar from "@/components/navbar";
import KitchenOrderCard from "@/components/kitchen-order-card";
import { Card, CardContent } from "@/components/ui/card";
import { OrderWithDetails, OrderStatus } from "@shared/schema";
import { Clock, Flame, CheckCircle } from "lucide-react";

export default function KitchenDashboard() {
  const { user } = useAuth();
  
  const { data: orders = [] } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Set up WebSocket for real-time updates
  useWebSocket();

  const newOrders = orders.filter(order => order.status === OrderStatus.NEW);
  const preparingOrders = orders.filter(order => order.status === OrderStatus.PREPARING);
  const readyOrders = orders.filter(order => order.status === OrderStatus.READY);

  if (!user) return null;

  return (
    <div className="min-h-screen restaurant-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel da Cozinha</h1>
          <p className="text-gray-600">Gerencie pedidos em preparo</p>
        </div>

        {/* Kitchen Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Novos Pedidos</p>
                  <p className="text-2xl font-semibold text-gray-900">{newOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Flame className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Em Preparo</p>
                  <p className="text-2xl font-semibold text-gray-900">{preparingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Prontos</p>
                  <p className="text-2xl font-semibold text-gray-900">{readyOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders in Kitchen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Orders - Priority display */}
          {newOrders.map(order => (
            <KitchenOrderCard key={order.id} order={order} />
          ))}
          
          {/* Preparing Orders */}
          {preparingOrders.map(order => (
            <KitchenOrderCard key={order.id} order={order} />
          ))}
          
          {/* Ready Orders */}
          {readyOrders.map(order => (
            <KitchenOrderCard key={order.id} order={order} />
          ))}
        </div>

        {orders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido na cozinha
              </h3>
              <p className="text-gray-600">
                Os novos pedidos aparecerão aqui automaticamente
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
