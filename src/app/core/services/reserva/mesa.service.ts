import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mesa {
  id: number;
  numero: number;
  capacidade: number;
  disponivel: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MesaService {
  private baseUrl = 'http://localhost:5009/api/mesas';

  constructor(private http: HttpClient) { }

  findAll(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(this.baseUrl);
  }

  findByCapacidade(capacidadeMinima: number): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${this.baseUrl}/capacidade/${capacidadeMinima}`);
  }

  findDisponiveis(data: string, horario: string): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${this.baseUrl}/disponiveis`, {
      params: {
        data: data,
        horario: horario
      }
    });
  }
}