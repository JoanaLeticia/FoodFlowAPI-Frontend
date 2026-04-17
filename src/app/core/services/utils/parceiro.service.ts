import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParceiroApp } from '../../models/parceiro-app.model'; 

export interface ParceiroDTO {
    nome: string;
    percentualComissao: number;
    taxaFixa: number;
}

@Injectable({
    providedIn: 'root'
})
export class ParceiroService {
    private baseUrl = 'http://localhost:5009/api/parceiros';

    constructor(private httpClient: HttpClient) { }

    create(dto: ParceiroDTO): Observable<ParceiroApp> {
        return this.httpClient.post<ParceiroApp>(this.baseUrl, dto);
    }

    update(id: number, dto: ParceiroDTO): Observable<ParceiroApp> {
        return this.httpClient.put<ParceiroApp>(`${this.baseUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }

    findById(id: number): Observable<ParceiroApp> {
        return this.httpClient.get<ParceiroApp>(`${this.baseUrl}/${id}`);
    }

    findAll(page: number, pageSize: number, sort: string = 'id'): Observable<ParceiroApp[]> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString())
            .set('sort', sort);
        return this.httpClient.get<ParceiroApp[]>(this.baseUrl, { params });
    }

    findAllSimple(): Observable<ParceiroApp[]> {
    return this.httpClient.get<ParceiroApp[]>(this.baseUrl);
  }

    findByNome(nome: string, page: number, pageSize: number, sort: string = 'id'): Observable<ParceiroApp[]> {
        const params = new HttpParams()
            .set('nome', nome)
            .set('page', page.toString())
            .set('pageSize', pageSize.toString())
            .set('sort', sort);
        return this.httpClient.get<ParceiroApp[]>(`${this.baseUrl}/search`, { params });
    }

    count(nome?: string): Observable<number> {
        let params = new HttpParams();
        if (nome) {
            params = params.set('nome', nome);
        }
        return this.httpClient.get<number>(`${this.baseUrl}/count`, { params });
    }
}