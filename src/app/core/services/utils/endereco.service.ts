import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endereco } from '../../models/endereco.model';


@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private baseUrl = 'http://localhost:5009/api/enderecos';

  constructor(private httpClient: HttpClient) { }

  findAll(): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(this.baseUrl);
  }

  findByLogradouro(logradouro: string): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(`${this.baseUrl}/search/logradouro/${logradouro}`);
  }

  findById(id: number): Observable<Endereco> {
    return this.httpClient.get<Endereco>(`${this.baseUrl}/${id}`);
  }

  insert(endereco: {
    logradouro: string,
    numero: string,
    complemento?: string,
    bairro: string,
    cep: string,
    idMunicipio: number,
    idCliente: number
  }): Observable<Endereco> {
    console.log('Enviando dados para criar endereço:', endereco);
    return this.httpClient.post<Endereco>(this.baseUrl, endereco);
  }

  update(enderecoDTO: any): Observable<Endereco> {
    return this.httpClient.put<Endereco>(`${this.baseUrl}/${enderecoDTO.id}`, enderecoDTO);
  }

  delete(endereco: Endereco): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${endereco.id}`);
  }

  findByClienteId(clienteId: number): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(`${this.baseUrl}/cliente/${clienteId}`);
  }
}