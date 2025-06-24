export interface PedidoItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  category: 'prato' | 'bebida' | 'bombom' | 'outros';
  preparationArea: 'cozinha' | 'bar' | 'balcao' | 'nenhum';
  observacoes?: string;
}

export interface Pedido {
  id: string;
  mesaId: string;
  numeroMesa: number;
  itens: PedidoItem[];
  status: 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'finalizado';
  total: number;
  horarioInicio: string;
  horarioFinalizacao?: string;
  metodoPagamento?: 'pix' | 'debito' | 'credito' | 'dinheiro';
  valorRecebido?: number;
  troco?: number;
}

export interface Mesa {
  id: string;
  numero: number;
  status: 'livre' | 'ocupada' | 'pagamento_pendente';
  pedidoAtual?: string;
  capacidade: number;
}

export interface CashRegister {
  isOpen: boolean;
  openedAt?: string;
  closedAt?: string;
  initialAmount: number;
  totalSales: number;
  pixAmount: number;
  debitAmount: number;
  creditAmount: number;
  cashAmount: number;
}