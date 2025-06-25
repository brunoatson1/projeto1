import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import Navbar from "@/components/navbar";
import TableGrid from "@/components/table-grid";
import OrderInterface from "@/components/order-interface";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableStatus } from "@shared/schema";
import { Users, Bell, Receipt, Coffee } from "lucide-react";

export default function AtendenteDashboard() {
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
  });
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats/today"],
  });

  // Set up WebSocket for real-time updates
  useWebSocket();

  const freeTables = tables.filter(table => table.status === TableStatus.FREE).length;
  const occupiedTables = tables.filter(table => table.status === TableStatus.OCCUPIED).length;
  const readyTables = tables.filter(table => table.status === TableStatus.READY).length;

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
  };

  const handleCloseOrder = () => {
    setSelectedTable(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen restaurant-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel do Atendente</h1>
          <p className="text-gray-600">Gerencie mesas e pedidos</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Coffee className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Mesas Livres</p>
                  <p className="text-2xl font-semibold text-gray-900">{freeTables}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Mesas Ocupadas</p>
                  <p className="text-2xl font-semibold text-gray-900">{occupiedTables}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pratos Prontos</p>
                  <p className="text-2xl font-semibold text-gray-900">{readyTables}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Receipt className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pedidos Hoje</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        {!selectedTable && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mesas do Restaurante</h2>
              <TableGrid tables={tables} onTableSelect={handleTableSelect} />
            </CardContent>
          </Card>
        )}

        {/* Order Interface */}
        {selectedTable && (
          <OrderInterface 
            table={selectedTable} 
            onClose={handleCloseOrder}
          />
        )}
      </div>
    </div>
  );
}
