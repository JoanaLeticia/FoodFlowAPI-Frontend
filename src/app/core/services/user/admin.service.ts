import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Admin } from '../../models/admin.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:5009/api/administradores';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, size?: number): Observable<Admin[]> {
    let params = {};

    if (page !== undefined && size !== undefined) {
      params = {
        page: page.toString(),
        size: size.toString()
      }
    }

    return this.httpClient.get<{ dados: Admin[] }>(this.baseUrl, { params }).pipe(
      map(response => response.dados)
    );
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  findByNome(nome: string, page?: number, size?: number, sort?: string): Observable<Admin[]> {
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

    return this.httpClient.get<Admin[]>(`${this.baseUrl}/search/nome/${nome}`, { params });
  }

  findById(id: number): Observable<Admin> {
    return this.httpClient.get<Admin>(`${this.baseUrl}/${id}`);
  }

  create(administrador: Admin): Observable<Admin> {
    return this.httpClient.post<Admin>(this.baseUrl, administrador);
  }

  update(administrador: Admin): Observable<Admin> {
    return this.httpClient.put<Admin>(`${this.baseUrl}/${administrador.id}`, administrador);
  }

  delete(administrador: Admin): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${administrador.id}`);
  }

}