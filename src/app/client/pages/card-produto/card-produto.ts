import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ItemCardapio } from '../../../core/models/item-cardapio.model';
import { ItemCardapioService } from '../../../core/services/pratos/item-cardapio.service';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';

@Component({
  selector: 'app-card-produto',
  imports: [CommonModule, MatIcon],
  templateUrl: './card-produto.html',
  styleUrl: './card-produto.css',
})
export class CardProduto {
  @Input() itemCardapio!: ItemCardapio;
  @Output() adicionar = new EventEmitter<ItemCardapio>();

  constructor(private carrinhoService: CarrinhoService) {}

  isIncompativel(): boolean {
    if (!this.itemCardapio) return false;
    return this.carrinhoService.isItemIncompativel(
      this.itemCardapio.periodo as any,
    );
  }

  onAdicionar(event: MouseEvent) {
    event.stopPropagation();
    if (this.isIncompativel()) return;

    this.adicionar.emit(this.itemCardapio);
  }
}
