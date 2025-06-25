import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OrderWithDetails, OrderStatus } from "@shared/schema";
import { Clock, Play, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KitchenOrderCardProps {
  order: OrderWithDetails;
}

export default function KitchenOrderCard({ order }: KitchenOrderCardProps) {
  const { toast } = useToast();

  const updateOrderMutation = useMutation({
    mutationFn: async (updates: Partial<{ status: OrderStatus }>) => {
      const response = await apiRequest("PUT", `/api/orders/${order.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW:
        return {
          label: "NOVO",
          variant: "default" as const,
          color: "kitchen-new",
          bgColor: "bg-red-50",
          borderColor: "border-red-400",
          animate: "animate-pulse",
        };
      case OrderStatus.PREPARING:
        return {
          label: "PREPARANDO",
          variant: "destructive" as const,
          color: "kitchen-preparing",
          bgColor: "bg-red-50",
          borderColor: "border-red-600",
          animate: "",
        };
      case OrderStatus.READY:
        return {
          label: "PRONTO",
          variant: "default" as const,
          color: "kitchen-ready",
          bgColor: "bg-green-50",
          borderColor: "border-green-500",
          animate: "animate-bounce",
        };
      default:
        return {
          label: "NOVO",
          variant: "default" as const,
          color: "kitchen-new",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-300",
          animate: "",
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  const handleStartPreparing = () => {
    updateOrderMutation.mutate({ status: OrderStatus.PREPARING });
  };

  const handleMarkAsReady = () => {
    updateOrderMutation.mutate({ status: OrderStatus.READY });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={`${statusConfig.bgColor} border-l-4 ${statusConfig.borderColor} ${statusConfig.animate}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Mesa {order.table.number.toString().padStart(2, '0')}
            </h3>
            <p className="text-sm text-gray-500">Pedido #{order.id.toString().padStart(6, '0')}</p>
            <p className="text-xs text-gray-400">
              {order.status === OrderStatus.NEW && `Recebido: ${formatTime(order.createdAt)}`}
              {order.status === OrderStatus.PREPARING && `Iniciado: ${formatTime(order.updatedAt)}`}
              {order.status === OrderStatus.READY && `Pronto: ${formatTime(order.updatedAt)}`}
            </p>
          </div>
          <Badge 
            variant={statusConfig.variant}
            className={`${statusConfig.animate} font-medium`}
          >
            {statusConfig.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.product.name}
              </span>
              {item.notes && (
                <span className="text-gray-500 italic">({item.notes})</span>
              )}
            </div>
          ))}
          
          {order.notes && (
            <div className="text-sm text-gray-600 bg-white p-2 rounded border-l-2 border-blue-200">
              <strong>Obs:</strong> {order.notes}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {order.status === OrderStatus.NEW && (
            <Button
              onClick={handleStartPreparing}
              disabled={updateOrderMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              <Play className="h-4 w-4 mr-1" />
              {updateOrderMutation.isPending ? "Iniciando..." : "Iniciar Preparo"}
            </Button>
          )}
          
          {order.status === OrderStatus.PREPARING && (
            <Button
              onClick={handleMarkAsReady}
              disabled={updateOrderMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {updateOrderMutation.isPending ? "Finalizando..." : "Marcar Pronto"}
            </Button>
          )}
          
          {order.status === OrderStatus.READY && (
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">
                Aguardando retirada pelo atendente
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
