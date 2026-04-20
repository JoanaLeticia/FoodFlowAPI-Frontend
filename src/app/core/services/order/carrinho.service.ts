import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  switchMap,
} from 'rxjs';
import { ItemCardapio } from '../../models/item-cardapio.model';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CarrinhoService {
  private readonly CARRINHO_PREFIX = 'carrinho_';
  private carrinhoSubject = new BehaviorSubject<ItemCardapio[]>([]);

  carrinho$: Observable<ItemCardapio[]> = this.carrinhoSubject.asObservable();

  constructor(private authService: AuthService) {
    this.authService
      .getUsuarioLogado()
      .pipe(
        distinctUntilChanged(),
        switchMap((usuario) => {
          const userId = usuario?.id || 'anonimo';
          return this.loadCartForUser(userId);
        }),
      )
      .subscribe((carrinho) => {
        this.carrinhoSubject.next(carrinho);
      });
  }

  private getCartKey(userId: string | number): string {
    return `${this.CARRINHO_PREFIX}${userId}`;
  }

  private loadCartForUser(userId: string | number): Observable<ItemCardapio[]> {
    const carrinho = this.obterCarrinhoLocal(userId);
    return new Observable((observer) => {
      observer.next(carrinho);
      observer.complete();
    });
  }

  private obterCarrinhoLocal(userId: string | number): ItemCardapio[] {
    const carrinho = localStorage.getItem(this.getCartKey(userId));
    return carrinho ? JSON.parse(carrinho) : [];
  }

  private salvarCarrinho(
    userId: string | number,
    carrinho: ItemCardapio[],
  ): void {
    localStorage.setItem(this.getCartKey(userId), JSON.stringify(carrinho));
    this.carrinhoSubject.next(carrinho);
  }

  private getCurrentUserId(): string | number {
    const usuario = this.authService.getUsuariologadoSnapshot();
    return usuario?.id || 'anonimo';
  }

  transferirCarrinhoParaUsuario(userId: number): void {
    const carrinhoAnonimo = this.obterCarrinhoLocal('anonimo');

    if (carrinhoAnonimo.length > 0) {
      carrinhoAnonimo.forEach((item) => {
        this.adicionarItemParaUsuario(userId, item);
      });
      this.limparCarrinhoEspecifico('anonimo');
    }
  }

  isItemIncompativel(periodoNovoItem: any): boolean {
    const carrinhoAtual = this.carrinhoSubject.value;

    if (carrinhoAtual.length === 0) return false;

    const periodoDoCarrinho = carrinhoAtual[0].periodo;

    return String(periodoNovoItem) !== String(periodoDoCarrinho);
  }

  adicionarItem(item: ItemCardapio): void {
    const userId = this.getCurrentUserId();
    const carrinho = this.obterCarrinhoLocal(userId);

    if (carrinho.length > 0) {
      const periodoAtual = carrinho[0].periodo;
      if (String(item.periodo) !== String(periodoAtual)) {
        alert(
          `Não é possível misturar itens! O seu carrinho já possui pratos do período: ${periodoAtual}. Finalize o pedido ou esvazie o carrinho.`,
        );
        return;
      }
    }

    const itemExistente = carrinho.find((i) => i.id === item.id);

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      carrinho.push({ ...item, quantidade: 1 });
    }

    this.salvarCarrinho(userId, carrinho);
  }

  atualizarQuantidade(itemId: number, quantidade: number): void {
    const userId = this.getCurrentUserId();
    const carrinho = this.obterCarrinhoLocal(userId);
    const item = carrinho.find((i) => i.id === itemId);

    if (item) {
      if (quantidade < 1) {
        this.removerItem(itemId);
      } else {
        item.quantidade = quantidade;
        this.salvarCarrinho(userId, carrinho);
      }
    }
  }

  removerItem(itemId: number): void {
    const userId = this.getCurrentUserId();
    const carrinho = this.obterCarrinhoLocal(userId).filter(
      (item) => item.id !== itemId,
    );
    this.salvarCarrinho(userId, carrinho);
  }

  limparCarrinho(): void {
    const userId = this.getCurrentUserId();
    this.salvarCarrinho(userId, []);
  }

  getTotalItens(): number {
    return this.carrinhoSubject.value.reduce(
      (total, item) => total + item.quantidade,
      0,
    );
  }

  getTotalValor(): number {
    return this.carrinhoSubject.value.reduce((total, item) => {
      const precoFinal = item.isSugestaoChefe
        ? (item.precoComDesconto ?? item.precoBase)
        : item.precoBase;

      return total + (precoFinal * item.quantidade);
    }, 0);
  }

  adicionarItemParaUsuario(userId: string | number, item: ItemCardapio): void {
    const carrinho = this.obterCarrinhoLocal(userId);
    const itemExistente = carrinho.find((i) => i.id === item.id);

    if (itemExistente) {
      itemExistente.quantidade += item.quantidade || 1;
    } else {
      carrinho.push({ ...item, quantidade: item.quantidade || 1 });
    }

    this.salvarCarrinho(userId, carrinho);
  }

  limparCarrinhoEspecifico(userId: string | number): void {
    localStorage.removeItem(this.getCartKey(userId));

    if (userId === this.getCurrentUserId()) {
      this.carrinhoSubject.next([]);
    }
  }

  getItens(): ItemCardapio[] {
    return [...this.carrinhoSubject.value];
  }
}
