import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { catchError, map } from 'rxjs/operators';
import { Endereco } from '../../models/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = 'http://localhost:5009/api/clientes';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, pageSize?: number): Observable<Cliente[]> {
    let params = {};

    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      }
    }

    return this.httpClient.get<{ dados: Cliente[] }>(this.baseUrl, { params }).pipe(
      map(response => response.dados)
    );
  }

  findByNome(nome: string): Observable<Cliente[]> {
    return this.httpClient.get<Cliente[]>(`${this.baseUrl}/search/nome/${nome}`);
  }

  findById(id: number): Observable<Cliente> {
    return this.httpClient.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  insert(cliente: Cliente): Observable<Cliente> {
    return this.httpClient.post<Cliente>(this.baseUrl, cliente);
  }

  update(cliente: Cliente): Observable<Cliente> {
    return this.httpClient.put<Cliente>(`${this.baseUrl}/${cliente.id}`, cliente);
  }

  getEnderecos(): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(`${this.baseUrl}/meus-enderecos`);
  }

  updateParcial(dados: any, id: Number): Observable<Cliente> {
    return this.httpClient.put<Cliente>(`${this.baseUrl}/parcial/${id}`, dados);
  }

  delete(cliente: Cliente): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${cliente.id}`);
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'senha-atual': senhaAtual
    });

    return this.httpClient.patch(
      `${this.baseUrl}/updateSenha/${encodeURIComponent(novaSenha)}`,
      {},
      {
        headers,
        responseType: 'text'
      }
    ).pipe(
      map(response => {
        try {
          return JSON.parse(response);
        } catch {
          return { message: response };
        }
      }),
      catchError(error => {
        console.error('Erro na requisição:', error);
        let errorMessage = 'Erro desconhecido';

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          try {
            errorMessage = JSON.parse(error.error).error || error.message;
          } catch {
            errorMessage = error.error || error.message;
          }
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}