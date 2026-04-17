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
