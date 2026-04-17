import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Usuario } from '../core/models/usuario.model';
import { LocalStorageService } from '../core/services/local-storage.service';
import { Cliente } from '../core/models/cliente.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CarrinhoService } from '../core/services/order/carrinho.service';

export interface TelefoneDTO {
  codArea: string;
  numero: string;
}

export interface EnderecoDTO {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  idMunicipio: number;
}

// 2. Renomeamos e completamos a interface de registro para espelhar o ClienteDTO.java
export interface ClienteDTO {
  nome: string;
  email: string;
  senha: string;
  listaTelefone: TelefoneDTO[];
  listaEndereco: EnderecoDTO[];
}

export interface RegisterResponse {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseURL: string = 'http://localhost:5009/api/auth/login';
  private clienteURL: string = 'http://localhost:5009/api/clientes'
  private tokenKey = 'jwt_token';
  private usuarioLogadoKey = 'usuario_logado';
  private usuarioLogadoSubject = new BehaviorSubject<Usuario | null>(null);
  private adminTokenKey = 'admin_token';
  private isAdminSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private jwtHelper: JwtHelperService,
    private injector: Injector
  ) {

    this.initUsuarioLogado();

  }

  private initUsuarioLogado() {
    const usuario = this.localStorageService.getItem(this.usuarioLogadoKey);
    if (usuario) {
      const usuarioLogado = usuario;
      this.setUsuarioLogado(usuarioLogado);
      this.usuarioLogadoSubject.next(usuarioLogado);

      if (this.getAdminToken()) {
        this.isAdminSubject.next(true);
      }
    }
  }

  login(email: string, senha: string): Observable<any> {
    const params = {
      login: email,
      senha: senha,
      perfil: '2'
    }

    return this.http.post(`${this.baseURL}`, params, { observe: 'response' }).pipe(
      tap((res: any) => {
        const authToken = res.headers.get('Authorization') ?? '';
        if (authToken) {
          this.setToken(authToken);
          const usuarioLogado = res.body;

          if (usuarioLogado) {
            const carrinhoService = this.injector.get(CarrinhoService);

            carrinhoService.transferirCarrinhoParaUsuario(usuarioLogado.id);

            this.setUsuarioLogado(usuarioLogado);
            this.usuarioLogadoSubject.next(usuarioLogado);
          }
        }
      }),
      map((res: any) => res.body)
    );
  }

  getUsuarioNome(): string | null {
    const usuario = this.getUsuariologadoSnapshot();
    return usuario?.nome || null;
  }

  loginADM(email: string, senha: string): Observable<any> {
    const params = {
      login: email,
      senha: senha,
      perfil: '1'
    }

    return this.http.post(`${this.baseURL}`, params, { observe: 'response' }).pipe(
      tap((res: any) => {
        const authToken = res.headers.get('Authorization') ?? '';
        if (authToken) {
          this.setAdminToken(authToken); // Novo método para token admin
          const usuarioLogado = res.body;
          if (usuarioLogado) {
            this.setUsuarioLogado(usuarioLogado);
            this.usuarioLogadoSubject.next(usuarioLogado);
          }
        }
      }),
      catchError(error => {
        console.error('Login admin failed:', error);
        return throwError(() => error);
      })
    );
  }

  logoutCompleto(): void {
    // Remove todos os tokens e dados de autenticação
    this.removeToken();        // Token de cliente
    this.removeAdminToken();   // Token de admin
    this.removeUsuarioLogado(); // Dados do usuário

    // Notifica todos os subscribers que não há mais usuário logado
    this.usuarioLogadoSubject.next(null);
    this.isAdminSubject.next(false);

    console.log('Logout completo realizado');
  }

  getUserProfile(): 'CLIENTE' | 'ADMIN' | null {
    const token = this.getToken() || this.getAdminToken();
    if (!token) return null;

    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.perfil || null;
    } catch {
      return null;
    }
  }

  setAdminToken(token: string): void {
    this.localStorageService.setItem(this.adminTokenKey, token);
    this.isAdminSubject.next(true);
  }

  getAdminToken(): string | null {
    return this.localStorageService.getItem(this.adminTokenKey);
  }

  removeAdminToken(): void {
    this.localStorageService.removeItem(this.adminTokenKey);
  }

  isAdminLoggedIn(): boolean {
    const token = this.getAdminToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  setUsuarioLogado(usuario: Usuario): void {
    this.localStorageService.setItem(this.usuarioLogadoKey, usuario);
  }

  setToken(token: string): void {
    this.localStorageService.setItem(this.tokenKey, token);
  }

  getUsuarioLogado() {
    return this.usuarioLogadoSubject.asObservable();
  }

  // auth.service.ts
  getClienteCompleto(): Observable<Cliente | null> {
    const usuario = this.localStorageService.getItem(this.usuarioLogadoKey);
    console.log('Usuário no getClienteCompleto:', usuario); // Log temporário

    if (!usuario || !usuario.id) {
      console.warn('Usuário não encontrado ou sem ID no localStorage');
      return of(null);
    }

    return this.http.get<Cliente>(`${this.clienteURL}/${usuario.id}`).pipe(
      tap(cliente => console.log('Cliente recebido do backend: ', cliente)),
      catchError(error => {
        console.error('Erro ao buscar cliente: ', error);
        return of(null);
      })
    );
  }

  getToken(): string | null {
    return this.localStorageService.getItem(this.tokenKey);
  }

  removeToken(): void {
    this.localStorageService.removeItem(this.tokenKey);
  }

  removeUsuarioLogado(): void {
    this.localStorageService.removeItem(this.usuarioLogadoKey);
    this.usuarioLogadoSubject.next(null);
  }

  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken() || this.getAdminToken();
    if (!tokenToCheck) return true;

    try {
      return this.jwtHelper.isTokenExpired(tokenToCheck);
    } catch (error) {
      console.error("Token inválido", error);
      return true;
    }
  }

  getUsuariologadoSnapshot(): Usuario | null {
    return this.localStorageService.getItem(this.usuarioLogadoKey);
  }

  register(cliente: ClienteDTO): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.clienteURL}`, cliente);
  }

  getClienteId(): number | null {
    const usuario = this.getUsuariologadoSnapshot();
    return usuario?.id || null;
  }

  isLoggedIn(): boolean {
    const clienteToken = this.getToken();
    const clienteTokenValido = !!clienteToken && !this.isTokenExpired(clienteToken);

    const adminToken = this.getAdminToken();
    const adminTokenValido = !!adminToken && !this.isTokenExpired(adminToken);

    return clienteTokenValido || adminTokenValido;
  }

}