import React, { useState, useEffect } from 'react';
import { Mesa, Pedido, PedidoItem } from '../types';
import { apiService, menuItems } from '../services/api';
import { Plus, Minus, Send, X } from 'lucide-react';

export const AttendantPanel: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMesas();
    const interval = setInterval(loadMesas, 3000); // Atualizar mais frequentemente
    return () => clearInterval(interval);
  }, []);

  const loadMesas = async () => {
    try {
      const mesasData = await apiService.getMesas();
      setMesas(mesasData);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    }
  };

  const handleMesaClick = (mesa: Mesa) => {
    if (mesa.status === 'livre') {
      setSelectedMesa(mesa);
      setPedidoItems([]);
      setShowOrderModal(true);
    }
  };

  const addItemToPedido = (menuItem: PedidoItem) => {
    const existingItem = pedidoItems.find(item => item.id === menuItem.id);
    
    if (existingItem) {
      setPedidoItems(prevItems =>
        prevItems.map(item =>
          item.id === menuItem.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setPedidoItems(prevItems => [...prevItems, { ...menuItem, quantidade: 1 }]);
    }
  };

  const removeItemFromPedido = (itemId: string) => {
    setPedidoItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      if (existingItem && existingItem.quantidade > 1) {
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        );
      } else {
        return prevItems.filter(item => item.id !== itemId);
      }
    });
  };

  const calculateTotal = () => {
    return pedidoItems.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const enviarPedido = async () => {
    if (!selectedMesa || pedidoItems.length === 0) return;

    setLoading(true);
    try {
      const pedido: Omit<Pedido, 'id' | 'horarioInicio'> = {
        mesaId: selectedMesa.id,
        numeroMesa: selectedMesa.numero,
        itens: pedidoItems,
        status: 'pendente',
        total: calculateTotal()
      };

      await apiService.enviarPedido(pedido);
      
      setShowOrderModal(false);
      setSelectedMesa(null);
      setPedidoItems([]);
      
      // Recarregar mesas imediatamente para mostrar status atualizado
      await loadMesas();
      
      alert('Pedido enviado com sucesso! Comanda da cozinha foi impressa automaticamente.');
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getMesaStatusColor = (status: Mesa['status']) => {
    switch (status) {
      case 'livre':
        return 'bg-green-500 hover:bg-green-600';
      case 'ocupada':
        return 'bg-red-500 cursor-not-allowed';
      case 'pagamento_pendente':
        return 'bg-yellow-500 cursor-not-allowed';
      default:
        return 'bg-gray-500 cursor-not-allowed';
    }
  };

  const getMesaStatusText = (status: Mesa['status']) => {
    switch (status) {
      case 'livre':
        return 'Livre';
      case 'ocupada':
        return 'Ocupada';
      case 'pagamento_pendente':
        return 'Pagamento Pendente';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel do Atendente</h1>
        <p className="text-gray-600">Clique em uma mesa livre para fazer um pedido</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mesas.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => handleMesaClick(mesa)}
            disabled={mesa.status !== 'livre'}
            className={`
              p-6 rounded-lg text-white font-semibold text-lg transition-all duration-200
              ${getMesaStatusColor(mesa.status)}
              ${mesa.status === 'livre' ? 'shadow-md hover:shadow-lg transform hover:scale-105' : 'opacity-80'}
            `}
          >
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">Mesa {mesa.numero}</div>
              <div className="text-sm opacity-90">{getMesaStatusText(mesa.status)}</div>
              <div className="text-xs opacity-75 mt-1">{mesa.capacidade} lugares</div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal de Pedido */}
      {showOrderModal && selectedMesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b bg-blue-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Pedido - Mesa {selectedMesa.numero}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex h-[70vh]">
              {/* Menu Items */}
              <div className="w-1/2 p-6 border-r overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Menu</h3>
                <div className="space-y-3">
                  {menuItems.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.nome}</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {item.category} • {item.preparationArea}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          R$ {item.preco.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => addItemToPedido(item)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pedido Atual */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Pedido Atual</h3>
                {pedidoItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum item selecionado</p>
                ) : (
                  <div className="space-y-3">
                    {pedidoItems.map((item) => (
                      <div key={item.id} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.nome}</h4>
                            <p className="text-sm text-gray-600">
                              R$ {item.preco.toFixed(2)} x {item.quantidade}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => removeItemFromPedido(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-medium">{item.quantidade}</span>
                            <button
                              onClick={() => addItemToPedido(item)}
                              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">R$ {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarPedido}
                  disabled={loading || pedidoItems.length === 0}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Enviando...' : 'Enviar Pedido'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};