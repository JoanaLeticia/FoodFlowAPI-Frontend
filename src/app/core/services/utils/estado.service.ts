import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Estado } from '../../models/estado.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private baseUrl = 'http://localhost:5009/api/estados';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, size?: number): Observable<Estado[]> {
    let params = {};

    if (page !== undefined && size !== undefined) {
      params = {
        page: page.toString(),
        size: size.toString()
      }
    }

    return this.httpClient.get<{ dados: Estado[] }>(this.baseUrl, { params }).pipe(
      map(response => response.dados)
    );
  }


  findByNome(nome: string, page?: number, size?: number, sort?: string): Observable<Estado[]> {
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

    return this.httpClient.get<Estado[]>(`${this.baseUrl}/search/nome/${nome}`, { params });
  }

  findById(id: number): Observable<Estado> {
    return this.httpClient.get<Estado>(`${this.baseUrl}/${id}`);
  }

  insert(estado: Estado): Observable<Estado> {
    return this.httpClient.post<Estado>(this.baseUrl, estado);
  }

  update(estado: Estado): Observable<Estado> {
    return this.httpClient.put<Estado>(`${this.baseUrl}/${estado.id}`, estado);
  }

  delete(estado: Estado): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${estado.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

}