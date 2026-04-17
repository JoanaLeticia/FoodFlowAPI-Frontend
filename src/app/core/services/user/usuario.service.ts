import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = 'http://localhost:5009/api/usuarios';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, pageSize?: number, nome?: String): Observable<Usuario[]> {
    let params = {}
    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page.toString(),
        pageSize: pageSize.toString(),
        nome: nome
      }
    }
    return this.httpClient.get<Usuario[]>(`${this.baseUrl}`, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  findByNome(nome: string): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(`${this.baseUrl}/search/nome/${nome}`);
  }

  findById(id: number): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  create(usuario: Usuario): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.baseUrl, usuario);
  }

  update(usuario: Usuario): Observable<Usuario> {
    return this.httpClient.put<Usuario>(`${this.baseUrl}/${usuario.id}`, usuario);
  }

  delete(usuario: Usuario): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${usuario.id}`);
  }
}
