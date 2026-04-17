import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCardapio } from '../../models/item-cardapio.model'; 

export interface SugestaoChefResponse {
  id: number;
  itemAlmoco: ItemCardapio | null;
  itemJantar: ItemCardapio | null;
  data: string;
  ativa: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SugestaoChefeService {
  private baseUrl = 'http://localhost:5009/api/sugestoes-chef';

  constructor(private http: HttpClient) { }

  findSugestaoAtiva(): Observable<SugestaoChefResponse> {
    return this.http.get<SugestaoChefResponse>(`${this.baseUrl}/ativa`);
  }

  findByData(data: string): Observable<SugestaoChefResponse> {
    return this.http.get<SugestaoChefResponse>(`${this.baseUrl}/data/${data}`);
  }
}