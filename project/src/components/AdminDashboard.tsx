import React, { useState, useEffect } from 'react';
import { Pedido, Mesa } from '../types';
import { apiService } from '../services/api';
import { Clock, DollarSign, Printer, CreditCard, Smartphone, Banknote, Plus, Minus, Users, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cashRegister, setCashRegister] = useState<any>(null);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'debito' | 'credito' | 'dinheiro'>('pix');
  const [valorRecebido, setValorRecebido] = useState<string>('');
  const [initialCashAmount, setInitialCashAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [printingReport, setPrintingReport] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [pedidosData, mesasData, cashData] = await Promise.all([
        apiService.getPedidos(),
        apiService.getMesas(),
        apiService.getCashRegister()
      ]);
      setPedidos(pedidosData);
      setMesas(mesasData);
      setCashRegister(cashData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleImprimirRelatorio = async () => {
    if (!selectedPedido) return;

    setPrintingReport(true);
    try {
      await apiService.imprimirRelatorioCompleto(selectedPedido.id);
      alert('Relatório enviado para impressão!');
    } catch (error) {
      console.error('Erro ao imprimir relatório:', error);
      alert('Erro ao imprimir relatório. Verifique se a impressora está conectada.');
    } finally {
      setPrintingReport(false);
    }
  };

  const handleFinalizarPagamento = async () => {
    if (!selectedPedido) return;

    const valorRecebidoNum = parseFloat(valorRecebido);
    if (isNaN(valorRecebidoNum) || valorRecebidoNum <= 0) {
      alert('Valor recebido inválido');
      return;
    }

    if (paymentMethod === 'dinheiro' && valorRecebidoNum < selectedPedido.total) {
      alert('Valor recebido insuficiente');
      return;
    }

    setLoading(true);
    try {
      await apiService.finalizarPagamento(selectedPedido.id, paymentMethod, valorRecebidoNum);
      setShowPaymentModal(false);
      setSelectedPedido(null);
      setValorRecebido('');
      await loadData();
      alert('Pagamento finalizado com sucesso!');
    } catch (error) {
      console.error('Erro ao finalizar pagamento:', error);
      alert('Erro ao finalizar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const openCashRegister = async () => {
    const amount = parseFloat(initialCashAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Valor inicial inválido');
      return;
    }

    try {
      await apiService.openCashRegister(amount);
      setShowCashModal(false);
      setInitialCashAmount('');
      await loadData();
      alert('Caixa aberto com sucesso!');
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      alert('Erro ao abrir caixa. Tente novamente.');
    }
  };

  const closeCashRegister = async () => {
    if (window.confirm('Tem certeza que deseja fechar o caixa? Isso irá imprimir o relatório de fechamento.')) {
      try {
        await apiService.closeCashRegister();
        await loadData();
        alert('Caixa fechado com sucesso! Relatório enviado para impressão.');
      } catch (error) {
        console.error('Erro ao fechar caixa:', error);
        alert('Erro ao fechar caixa. Tente novamente.');
      }
    }
  };

  const getPedidosAtivos = () => {
    return pedidos.filter(p => p.status !== 'finalizado');
  };

  const getMesasOcupadas = () => {
    return mesas.filter(m => m.status === 'ocupada' || m.status === 'pagamento_pendente');
  };

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case 'pix':
        return <Smartphone className="h-5 w-5" />;
      case 'debito':
      case 'credito':
        return <CreditCard className="h-5 w-5" />;
      case 'dinheiro':
        return <Banknote className="h-5 w-5" />;
    }
  };

  const calculateTroco = () => {
    if (!selectedPedido || paymentMethod !== 'dinheiro') return 0;
    const valor = parseFloat(valorRecebido) || 0;
    return Math.max(0, valor - selectedPedido.total);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <div className="flex space-x-3">
            {!cashRegister?.isOpen ? (
              <button
                key="open-cash-button"
                onClick={() => setShowCashModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Abrir Caixa
              </button>
            ) : (
              <button
                key="close-cash-button"
                onClick={closeCashRegister}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              >
                <Minus className="h-4 w-4 mr-2" />
                Fechar Caixa
              </button>
            )}
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mesas Ocupadas</p>
                <p className="text-2xl font-bold text-gray-900">{getMesasOcupadas().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{getPedidosAtivos().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {cashRegister?.totalSales?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dinheiro no Caixa</p>
                <p className="text-lg font-bold text-gray-900">
                  R$ {cashRegister?.finalCashAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo do Caixa */}
        {cashRegister?.isOpen && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Resumo do Caixa</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Valor Inicial</p>
                <p className="font-bold">R$ {cashRegister.initialAmount?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">PIX</p>
                <p className="font-bold text-blue-600">R$ {cashRegister.pixAmount?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Débito</p>
                <p className="font-bold text-green-600">R$ {cashRegister.debitAmount?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Crédito</p>
                <p className="font-bold text-purple-600">R$ {cashRegister.creditAmount?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Dinheiro</p>
                <p className="font-bold text-yellow-600">R$ {cashRegister.cashAmount?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Pedidos Ativos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPedidosAtivos().map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Mesa {pedido.numeroMesa}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {pedido.itens.map((item, index) => (
                        <div key={index}>
                          {item.quantidade}x {item.nome}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      R$ {pedido.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      pedido.status === 'preparando' ? 'bg-blue-100 text-blue-800' :
                      pedido.status === 'pronto' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {pedido.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pedido.horarioInicio).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPedido(pedido);
                        setValorRecebido(pedido.total.toFixed(2));
                        setShowPaymentModal(true);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors flex items-center"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Receber
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {getPedidosAtivos().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum pedido ativo no momento.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showPaymentModal && selectedPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Finalizar Pagamento - Mesa {selectedPedido.numeroMesa}
              </h2>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Total do Pedido:</div>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {selectedPedido.total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'pix', label: 'PIX', icon: Smartphone },
                    { value: 'debito', label: 'Débito', icon: CreditCard },
                    { value: 'credito', label: 'Crédito', icon: CreditCard },
                    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setPaymentMethod(value as any)}
                      className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                        paymentMethod === value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Recebido
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              {paymentMethod === 'dinheiro' && parseFloat(valorRecebido) > selectedPedido.total && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <strong>Troco: R$ {calculateTroco().toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={handleImprimirRelatorio}
                  disabled={printingReport}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center disabled:opacity-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {printingReport ? 'Imprimindo...' : 'Imprimir'}
                </button>
                <button
                  onClick={handleFinalizarPagamento}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center disabled:opacity-50"
                >
                  {getPaymentIcon()}
                  <span className="ml-2">
                    {loading ? 'Processando...' : 'Confirmar'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Caixa */}
      {showCashModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Abrir Caixa</h2>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Inicial em Dinheiro
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={initialCashAmount}
                  onChange={(e) => setInitialCashAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Digite o valor em dinheiro que está sendo colocado no caixa para iniciar o dia
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => setShowCashModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={openCashRegister}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
              >
                Abrir Caixa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};