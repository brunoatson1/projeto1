import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Table, ProductWithCategory, PaymentMethod, OrderStatus } from "@shared/schema";
import { X, Plus, Minus, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderInterfaceProps {
  table: Table;
  onClose: () => void;
}

interface OrderItem {
  productId: number;
  product: ProductWithCategory;
  quantity: number;
  unitPrice: string;
  notes?: string;
}

export default function OrderInterface({ table, onClose }: OrderInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isClosingOrder, setIsClosingOrder] = useState(false);

  const { data: products = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Pedido criado",
        description: `Pedido da mesa ${table.number} foi enviado para a cozinha`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createOrderItemMutation = useMutation({
    mutationFn: async ({ orderId, item }: { orderId: number; item: any }) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/items`, item);
      return response.json();
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Pedido fechado",
        description: `Pedido da mesa ${table.number} foi finalizado`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao fechar pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToOrder = (product: ProductWithCategory) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: product.price,
        notes: "",
      };
      setOrderItems(items => [...items, newItem]);
    }
  };

  const updateItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(productId);
      return;
    }
    
    setOrderItems(items =>
      items.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromOrder = (productId: number) => {
    setOrderItems(items => items.filter(item => item.productId !== productId));
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      return total + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);
  };

  const handleSendToKitchen = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "Pedido vazio",
        description: "Adicione pelo menos um item ao pedido",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderData = {
        tableId: table.id,
        notes: orderNotes,
        total: getTotalPrice().toFixed(2),
        status: OrderStatus.NEW,
      };

      const order = await createOrderMutation.mutateAsync(orderData);

      // Add all order items
      await Promise.all(
        orderItems.map(item =>
          createOrderItemMutation.mutateAsync({
            orderId: order.id,
            item: {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              notes: item.notes,
            },
          })
        )
      );
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handleCloseOrder = async () => {
    if (!paymentMethodId) {
      toast({
        title: "Método de pagamento obrigatório",
        description: "Selecione um método de pagamento para fechar o pedido",
        variant: "destructive",
      });
      return;
    }

    if (table.currentOrder) {
      await updateOrderMutation.mutateAsync({
        orderId: table.currentOrder,
        updates: {
          status: OrderStatus.PAID,
          paymentMethodId: parseInt(paymentMethodId),
          paymentNotes,
        },
      });
    }
  };

  const canCloseOrder = table.currentOrder && table.status !== "free";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Pedido - Mesa {table.number.toString().padStart(2, '0')}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cardápio</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 ml-4">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-500">{product.description}</p>
                    <p className="text-lg font-semibold text-primary">R$ {product.price}</p>
                  </div>
                  <Button
                    onClick={() => addToOrder(product)}
                    className="bg-primary hover:bg-secondary"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do Pedido</h3>
            
            {orderItems.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Nenhum item selecionado</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className="font-medium">{item.product.name}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                          R$ {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromOrder(item.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <hr className="my-3" />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">R$ {getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </Label>
              <Textarea
                id="notes"
                placeholder="Observações especiais do pedido..."
                rows={3}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>

            {/* Order Actions */}
            {!canCloseOrder ? (
              <Button
                onClick={handleSendToKitchen}
                disabled={orderItems.length === 0 || createOrderMutation.isPending}
                className="w-full bg-primary hover:bg-secondary"
              >
                <Send className="h-4 w-4 mr-2" />
                {createOrderMutation.isPending ? "Enviando..." : "Enviar para Cozinha"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="payment-method">Método de Pagamento</Label>
                    <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment-notes">Observações do Pagamento</Label>
                    <Textarea
                      id="payment-notes"
                      placeholder="Observações sobre o pagamento..."
                      rows={2}
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCloseOrder}
                  disabled={!paymentMethodId || updateOrderMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {updateOrderMutation.isPending ? "Fechando..." : "Fechar Pedido"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
