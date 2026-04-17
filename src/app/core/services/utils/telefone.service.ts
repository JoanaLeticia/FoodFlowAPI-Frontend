import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Telefone } from '../../models/telefone.model';

@Injectable({
    providedIn: 'root'
  })
export class TelefoneService {
    private baseUrl = 'http://localhost:5009/api/telefones';
  
    constructor(private httpClient: HttpClient) {  }
  
    findAll(): Observable<Telefone[]> {
      return this.httpClient.get<Telefone[]>(this.baseUrl);
    }

    findByNumero(numero: string): Observable<Telefone[]> {
      return this.httpClient.get<Telefone[]>(`${this.baseUrl}/search/numero/${numero}`);
    }
  
    findById(id: number): Observable<Telefone> {
      return this.httpClient.get<Telefone>(`${this.baseUrl}/${id}`);
    }
  
    insert(administrador: Telefone): Observable<Telefone> {
      return this.httpClient.post<Telefone>(this.baseUrl, administrador);
    }
    
    update(administrador: Telefone): Observable<Telefone> {
      return this.httpClient.put<Telefone>(`${this.baseUrl}/${administrador.id}`, administrador);
    }
  
    delete(administrador: Telefone): Observable<any> {
      return this.httpClient.delete<any>(`${this.baseUrl}/${administrador.id}`);
    }
}