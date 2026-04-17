import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ItemCardapio } from "../../models/item-cardapio.model";
import { TipoPeriodo } from "../../models/tipo-periodo.model";
import { PaginacaoResponse } from "../../models/paginacao-response.model";

interface ItemCardapioSimplificado {
    id?: number;
    nome: string;
    descricao: string;
    precoBase: number;
    idPeriodo?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ItemCardapioService {
    private baseUrl = 'http://localhost:5009/api/itens-cardapio';
    http: any;

    constructor(private httpClient: HttpClient) { }

    findAllPaginado(page: number, size: number): Observable<PaginacaoResponse<ItemCardapio>> {
        const params = {
            page: page.toString(),
            size: size.toString()
        };

        return this.httpClient.get<PaginacaoResponse<ItemCardapio>>(this.baseUrl, { params }).pipe(
            map(response => {
                response.dados = response.dados.map(item => ({
                    ...item,
                    urlImagem: this.getUrlImagem(item.nomeImagem)
                }));
                return response;
            })
        );
    }

    getUrlImagem(nomeImagem: string): string {
        if (!nomeImagem) {
            return 'assets/imagem-padrao.jpg';
        }
        return `${this.baseUrl}/image/download/${nomeImagem}`;
    }

    findAll(page: number, size: number): Observable<PaginacaoResponse<ItemCardapio>> {
        const params = {
            page: page.toString(),
            pageSize: size.toString()
        };
        return this.httpClient.get<PaginacaoResponse<ItemCardapio>>(this.baseUrl, { params });
    }

    findByNome(nome: string, page?: number, size?: number, sort?: string): Observable<ItemCardapio[]> {
        let params: any = {
            nome: nome
        };

        if (page !== undefined && size !== undefined) {
            params.page = page.toString();
            params.size = size.toString();
        }

        if (sort) {
            params.sort = sort;
        }

        return this.httpClient.get<ItemCardapio[]>(`${this.baseUrl}/search`, { params });
    }

    findById(id: number): Observable<ItemCardapio> {
        return this.httpClient.get<ItemCardapio>(`${this.baseUrl}/${id}`);
    }

    insert(produto: ItemCardapio | ItemCardapioSimplificado): Observable<ItemCardapio> {
        return this.httpClient.post<ItemCardapio>(this.baseUrl, produto);
    }

    update(produto: ItemCardapio | ItemCardapioSimplificado): Observable<ItemCardapio> {
        return this.httpClient.put<ItemCardapio>(`${this.baseUrl}/${produto.id}`, produto);
    }

    delete(produto: ItemCardapio): Observable<any> {
        return this.httpClient.delete<any>(`${this.baseUrl}/${produto.id}`);
    }

    uploadImagem(id: number, nomeImagem: string, imagem: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('id', id.toString());
        formData.append('nomeImagem', imagem.name);
        formData.append('imagem', imagem, imagem.name);

        return this.httpClient.patch<ItemCardapio>(`${this.baseUrl}/image/upload`, formData);
    }

    findPeriodos(): Observable<TipoPeriodo[]> {
        return this.httpClient.get<TipoPeriodo[]>(`${this.baseUrl}/periodos`);
    }

    getByPeriodo(nomePeriodo: string): Observable<ItemCardapio[]> {
        return this.httpClient.get<ItemCardapio[]>(`${this.baseUrl}/periodo/${nomePeriodo}`).pipe(
            map(produtos => produtos.map(produto => ({
                ...produto,
                urlImagem: this.getUrlImagem(produto.nomeImagem)
            })))
        );
    }

    getByPeriodoId(idPeriodo: number): Observable<ItemCardapio[]> {
        return this.httpClient.get<ItemCardapio[]>(`${this.baseUrl}/periodo/id/${idPeriodo}`).pipe(
            map(produtos => produtos.map(produto => ({
                ...produto,
                urlImagem: this.getUrlImagem(produto.nomeImagem)
            })))
        );
    }

    countByPeriodos(nomePeriodo: string, filtros: any): Observable<number> {
        return this.httpClient.get<number>(`${this.baseUrl}/periodo/${nomePeriodo}/count`, { params: filtros });
    }

    countByNome(nome: string): Observable<number> {
        return this.httpClient.get<number>(`${this.baseUrl}/nome/${nome}/count`);
    }

    count(): Observable<number> {
        return this.httpClient.get<number>(`${this.baseUrl}/count`);
    }

    getFiltrosPorPeriodo(nomePeriodo: string): Observable<any> {
        return this.httpClient.get<any>(`${this.baseUrl}/filtros/${nomePeriodo}`);
    }

    getByPeriodosPaginado(nomePeriodo: string, params: any): Observable<ItemCardapio[]> {
        return this.httpClient.get<ItemCardapio[]>(`${this.baseUrl}/periodo/${nomePeriodo}`, { params });
    }
}