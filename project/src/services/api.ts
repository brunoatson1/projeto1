import axios from 'axios';
import { Pedido, Mesa, PedidoItem } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';
export const LOCAL_PRINTER_SERVICE_URL = 'http://localhost:3001';

// Mock data para desenvolvimento
let mesas: Mesa[] = [
  { id: '1', numero: 1, status: 'livre', capacidade: 4 },
  { id: '2', numero: 2, status: 'livre', capacidade: 2 },
  { id: '3', numero: 3, status: 'livre', capacidade: 6 },
  { id: '4', numero: 4, status: 'livre', capacidade: 4 },
  { id: '5', numero: 5, status: 'livre', capacidade: 8 },
  { id: '6', numero: 6, status: 'livre', capacidade: 2 },
];

let pedidos: Pedido[] = [];

let cashRegister: { 
  isOpen: boolean; 
  openedAt?: string; 
  closedAt?: string; 
  initialAmount: number; 
  totalSales: number; 
  pixAmount: number; 
  debitAmount: number; 
  creditAmount: number; 
  cashAmount: number;
  finalCashAmount: number;
} = {
  isOpen: false,
  initialAmount: 0,
  totalSales: 0,
  pixAmount: 0,
  debitAmount: 0,
  creditAmount: 0,
  cashAmount: 0,
  finalCashAmount: 0,
};

// Itens disponíveis no menu
export const menuItems: PedidoItem[] = [
  {
    id: '1',
    nome: 'Pizza Margherita',
    preco: 35.90,
    quantidade: 1,
    category: 'prato',
    preparationArea: 'cozinha'
  },
  {
    id: '2',
    nome: 'Hambúrguer Artesanal',
    preco: 28.50,
    quantidade: 1,
    category: 'prato',
    preparationArea: 'cozinha'
  },
  {
    id: '3',
    nome: 'Refrigerante',
    preco: 6.00,
    quantidade: 1,
    category: 'bebida',
    preparationArea: 'bar'
  },
  {
    id: '4',
    nome: 'Suco Natural',
    preco: 8.50,
    quantidade: 1,
    category: 'bebida',
    preparationArea: 'bar'
  },
  {
    id: '5',
    nome: 'Brigadeiro',
    preco: 4.00,
    quantidade: 1,
    category: 'bombom',
    preparationArea: 'balcao'
  },
  {
    id: '6',
    nome: 'Salada Caesar',
    preco: 22.90,
    quantidade: 1,
    category: 'prato',
    preparationArea: 'cozinha'
  }
];

export const apiService = {
  // Mesas
  async getMesas(): Promise<Mesa[]> {
    return new Promise(resolve => setTimeout(() => resolve(mesas), 100));
  },

  async updateMesaStatus(mesaId: string, status: Mesa['status']): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (mesa) {
          mesa.status = status;
        }
        resolve();
      }, 100);
    });
  },

  // Pedidos
  async getPedidos(): Promise<Pedido[]> {
    return new Promise(resolve => setTimeout(() => resolve(pedidos), 100));
  },

  async enviarPedido(pedido: Omit<Pedido, 'id' | 'horarioInicio'>): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const novoPedido: Pedido = {
          ...pedido,
          id: Date.now().toString(),
          horarioInicio: new Date().toISOString(),
        };

        pedidos.push(novoPedido);

        // Atualizar status da mesa para ocupada
        const mesa = mesas.find(m => m.id === pedido.mesaId);
        if (mesa) {
          mesa.status = 'ocupada';
          mesa.pedidoAtual = novoPedido.id;
        }

        // Filtrar APENAS itens de cozinha (pratos) para impressão
        const itensCozinha = novoPedido.itens.filter(item => 
          item.category === 'prato' && item.preparationArea === 'cozinha'
        );
        
        if (itensCozinha.length > 0) {
          const pedidoCozinha = {
            ...novoPedido,
            itens: itensCozinha
          };

          try {
            // Imprimir APENAS comanda da cozinha (pratos)
            await axios.post(`${LOCAL_PRINTER_SERVICE_URL}/print/kitchen`, pedidoCozinha);
            console.log('Comanda da cozinha (apenas pratos) enviada para impressão');
          } catch (error) {
            console.warn('Erro ao imprimir comanda da cozinha:', error);
            // Continua mesmo se a impressão falhar
          }
        }

        setTimeout(() => resolve(novoPedido.id), 200);
      } catch (error) {
        reject(error);
      }
    });
  },

  async finalizarPagamento(pedidoId: string, metodoPagamento: 'pix' | 'debito' | 'credito' | 'dinheiro', valorRecebido: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) {
          throw new Error('Pedido não encontrado');
        }

        const troco = valorRecebido > pedido.total ? valorRecebido - pedido.total : 0;

        pedido.status = 'finalizado';
        pedido.metodoPagamento = metodoPagamento;
        pedido.valorRecebido = valorRecebido;
        pedido.troco = troco;
        pedido.horarioFinalizacao = new Date().toISOString();

        // Atualizar mesa para livre
        const mesa = mesas.find(m => m.id === pedido.mesaId);
        if (mesa) {
          mesa.status = 'livre';
          mesa.pedidoAtual = undefined;
        }

        // Atualizar caixa CORRETAMENTE
        if (cashRegister.isOpen) {
          cashRegister.totalSales += pedido.total;
          
          switch (metodoPagamento) {
            case 'pix':
              cashRegister.pixAmount += pedido.total;
              break;
            case 'debito':
              cashRegister.debitAmount += pedido.total;
              break;
            case 'credito':
              cashRegister.creditAmount += pedido.total;
              break;
            case 'dinheiro':
              cashRegister.cashAmount += pedido.total;
              // Atualizar valor final em dinheiro no caixa
              cashRegister.finalCashAmount = cashRegister.initialAmount + cashRegister.cashAmount;
              break;
          }
        }

        setTimeout(() => resolve(), 200);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Função para imprimir relatório completo (chamada separadamente)
  async imprimirRelatorioCompleto(pedidoId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (!pedido) {
          throw new Error('Pedido não encontrado');
        }

        // Imprimir relatório COMPLETO (todos os itens)
        try {
          await axios.post(`${LOCAL_PRINTER_SERVICE_URL}/print/receipt`, pedido);
          console.log('Relatório completo de consumo enviado para impressão');
          resolve();
        } catch (error) {
          console.warn('Erro ao imprimir relatório completo:', error);
          reject(error);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  // Caixa
  async getCashRegister() {
    return new Promise(resolve => setTimeout(() => resolve(cashRegister), 100));
  },

  async openCashRegister(initialAmount: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        cashRegister.isOpen = true;
        cashRegister.openedAt = new Date().toISOString();
        cashRegister.initialAmount = initialAmount;
        cashRegister.finalCashAmount = initialAmount; // Valor inicial em dinheiro
        cashRegister.totalSales = 0;
        cashRegister.pixAmount = 0;
        cashRegister.debitAmount = 0;
        cashRegister.creditAmount = 0;
        cashRegister.cashAmount = 0;
        resolve();
      }, 100);
    });
  },

  async closeCashRegister(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Imprimir relatório de fechamento de caixa
        const relatorioFechamento = {
          dataFechamento: new Date().toISOString(),
          valorInicial: cashRegister.initialAmount,
          totalVendas: cashRegister.totalSales,
          valorFinalDinheiro: cashRegister.finalCashAmount,
          pix: cashRegister.pixAmount,
          debito: cashRegister.debitAmount,
          credito: cashRegister.creditAmount,
          dinheiro: cashRegister.cashAmount
        };

        try {
          await axios.post(`${LOCAL_PRINTER_SERVICE_URL}/print/cash-close`, relatorioFechamento);
          console.log('Relatório de fechamento de caixa enviado para impressão');
        } catch (error) {
          console.warn('Erro ao imprimir relatório de fechamento:', error);
        }

        setTimeout(() => {
          cashRegister.isOpen = false;
          cashRegister.closedAt = new Date().toISOString();
          resolve();
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }
};