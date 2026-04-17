import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Municipio } from '../../models/municipio.model';
import { catchError, map } from 'rxjs/operators';
import { Estado } from '../../models/estado.model';


@Injectable({
  providedIn: 'root'
})
export class MunicipioService {
  private baseUrl = 'http://localhost:5009/api/municipios';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, pageSize?: number): Observable<Municipio[]> {
    let params = {};

    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      }
    }

    return this.httpClient.get<{ dados: Municipio[] }>(this.baseUrl, { params }).pipe(
      map(response => response.dados)
    );
  }

  findByNome(nome: string, page?: number, size?: number, sort?: string): Observable<Municipio[]> {
    let params: any = {};

    if (page !== undefined && size !== undefined) {
      params = {
        page: page.toString(),
        size: size.toString()
      }
    }

    if (sort) {
      params.sort = sort;
    }

    console.log(this.baseUrl);
    console.log({ params });

    return this.httpClient.get<Municipio[]>(`${this.baseUrl}/search/nome/${nome}`, { params });
  }

  findByNomeSemPaginacao(nome: string): Observable<Municipio[]> {
    return this.httpClient.get<any>(`${this.baseUrl}/search/nomesimple/${nome}`).pipe(
      map(response => {
        console.log('Resposta Completa: ', response);
        if (response && Array.isArray(response.dados)) {
          return response.dados;
        } else if (Array.isArray(response)) {
          return response;
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }

  findById(id: number): Observable<Municipio> {
    return this.httpClient.get<Municipio>(`${this.baseUrl}/${id}`);
  }

  insert(municipio: { id: number, nome: string, idEstado: number }): Observable<Municipio> {
    console.log('Enviando dados para criar município:', municipio);
    return this.httpClient.post<Municipio>(this.baseUrl, {
        nome: municipio.nome,
        idEstado: municipio.idEstado
    });
  }

  update(municipio: Municipio): Observable<Municipio> {
    return this.httpClient.put<Municipio>(`${this.baseUrl}/${municipio.id}`, municipio);
  }

  delete(municipio: Municipio): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/${municipio.id}`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.status === 204) {
          return true;
        }
        throw new Error('Resposta inesperada do servidor');
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro ao excluir município';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 409) {
          errorMessage = 'Não é possível excluir o município pois está vinculado a endereços.';
        } else if (error.status === 404) {
          errorMessage = 'Município não encontrado.';
        }

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          error: error.error
        }));
      })
    );
  }

  getEstados(): Observable<Estado[]> {
    return this.httpClient.get<Estado[]>(`${this.baseUrl}/estados`);
  }

  findByEstado(idEstado: number): Observable<Municipio[]> {
    return this.httpClient.get<Municipio[]>(`${this.baseUrl}/estados/estado/${idEstado}`);
  }
}