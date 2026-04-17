import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../../models/reserva.model';

export interface ReservaDTO {
  dataHora: string;
  idMesa: number;
  numeroPessoas: number;
}

export interface ReservaResponseDTO {
  id: number;
  usuario: any;
  mesa: MesaResponseDTO;
  dataHora: string;
  numeroPessoas: number;
  codigoConfirmacao: string;
}

export interface MesaResponseDTO {
  id: number;
  numero: number;
  capacidade: number;
  disponivel: boolean;
}

export interface DisponibilidadeMesa {
  mesa: MesaResponseDTO;
  horariosDisponiveis: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private baseUrl = 'http://localhost:5009/api/reservas';

  constructor(private http: HttpClient) { }

  create(reserva: ReservaDTO): Observable<ReservaResponseDTO> {
    return this.http.post<ReservaResponseDTO>(this.baseUrl, reserva);
  }

  verificarDisponibilidade(data: string, numeroPessoas: number): Observable<DisponibilidadeMesa[]> {
    return this.http.get<DisponibilidadeMesa[]>(`${this.baseUrl}/disponibilidade`, {
      params: {
        data: data,
        numeroPessoas: numeroPessoas.toString()
      }
    });
  }

  getHorariosDisponiveis(data: string, mesaId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/mesa/${mesaId}/horarios`, {
      params: { data: data }
    });
  }

  encontrarMesaDisponivel(data: string, horario: string, numeroPessoas: number): Observable<MesaResponseDTO | null> {
    return this.http.get<MesaResponseDTO | null>(`${this.baseUrl}/encontrar-mesa`, {
      params: {
        data: data,
        horario: horario,
        numeroPessoas: numeroPessoas.toString()
      }
    });
  }

  createConvidado(dto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/convidado`, dto);
  }

  getMinhasReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/minhas-reservas`);
  }

  cancelarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}