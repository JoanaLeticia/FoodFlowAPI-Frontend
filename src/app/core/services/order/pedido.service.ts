import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Pedido } from '../../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = 'http://localhost:5009/api/pedidos';

  constructor(private httpClient: HttpClient) { }

  findAll(): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(this.baseUrl);
  }

  findById(id: number): Observable<Pedido> {
    console.log('Serviço - Buscando pedido por ID:', id);
    return this.httpClient.get<Pedido>(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: (pedido) => console.log('Serviço - Pedido retornado:', pedido),
        error: (err) => console.error('Serviço - Erro na requisição:', err)
      })
    );
  }

  insert(pedidoData: { itens: Array<{ idProduto: number, quantidade: number }> }): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}`, pedidoData);
  }

  delete(Pedido: Pedido): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${Pedido.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  findLastByUser(): Observable<Pedido> {
    return this.httpClient.get<Pedido>(`${this.baseUrl}/ultimo-pedido`);
  }

  findByClienteId(clienteId: number): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`${this.baseUrl}/cliente/${clienteId}`);
  }

  getMeusPedidos(): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`${this.baseUrl}/meus-pedidos`);
  }
}