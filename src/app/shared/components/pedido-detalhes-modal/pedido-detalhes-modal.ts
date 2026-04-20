import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-pedido-detalhes-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './pedido-detalhes-modal.html',
  styleUrls: ['./pedido-detalhes-modal.css'],
})
export class PedidoDetalhesModalComponent {
  @Input() pedido: Pedido | null = null;
  @Output() close = new EventEmitter<void>();

  get itensAgrupados(): any[] {
    const pedidoAny = this.pedido as any;
    const listaItens = pedidoAny?.itens || pedidoAny?.itensPedido;

    if (!listaItens || !Array.isArray(listaItens)) return [];

    const mapa = new Map<number, any>();

    listaItens.forEach((item: any) => {
      if (mapa.has(item.id)) {
        mapa.get(item.id).quantidade++;
      } else {
        const qtdInicial = item.quantidade || 1;
        mapa.set(item.id, { ...item, quantidade: qtdInicial });
      }
    });

    return Array.from(mapa.values());
  }

  getStatusClass(status: any): string {
    if (status === undefined || status === null) return 'status-indefinido';
    return 'status-' + String(status).toLowerCase().replace('_', '-');
  }

  formatarTipoAtendimento(tipo: any): string {
    if (!tipo) return 'Indefinido';

    const dicionario: { [key: string]: string } = {
      PRESENCIAL: 'Retirada no Local',
      DELIVERY_PROPRIO: 'Delivery Próprio',
      DELIVERY_APLICATIVO: 'Delivery por Aplicativo',
    };

    return dicionario[tipo] || tipo;
  }

  formatarStatus(status: any): string {
    if (!status) return '';
    const dicionario: { [key: string]: string } = {
      PENDENTE: 'Pendente',
      CONFIRMADO: 'Confirmado',
      EM_PREPARO: 'Em Preparo',
      CONCLUIDO: 'Concluído',
      CANCELADO: 'Cancelado',
    };
    return dicionario[status] || status;
  }

  fecharModal() {
    this.close.emit();
  }
}
