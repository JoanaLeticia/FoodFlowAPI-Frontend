import { Component, NgModule, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { GridProdutos } from '../grid-produtos/grid-produtos';
import { ItemCardapio } from '../../../core/models/item-cardapio.model';
import { ActivatedRoute } from '@angular/router';
import { ItemCardapioService } from '../../../core/services/pratos/item-cardapio.service';
import { CommonModule } from '@angular/common';
import { SugestaoChefeService } from '../../../core/services/pratos/sugestao-chefe.service';
import { ReservaService, DisponibilidadeMesa } from '../../../core/services/reserva/reserva.service';
import { FormsModule } from '@angular/forms';
import { LoginModalComponent } from '../../modais/login/login';
import { RegistroModalComponent } from '../../modais/cadastro/registro';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DetalhesProdutoModalComponent } from '../../../shared/components/detalhes-produto-modal/detalhes-produto-modal';
import { CardapioCompletoModalComponent } from '../../../shared/components/cardapio-completo-modal/cardapio-completo-modal';
import { MeuPerfilModalComponent } from '../../../shared/components/meu-perfil-modal/meu-perfil-modal';
import { MeusPedidosModalComponent } from '../../../shared/components/meus-pedidos-modal/meus-pedidos-modal';
import { PedidoDetalhesModalComponent } from '../../../shared/components/pedido-detalhes-modal/pedido-detalhes-modal';
import { Pedido } from '../../../core/models/pedido.model';
import { MinhasReservasModalComponent } from '../../../shared/components/minhas-reservas-modal/minhas-reservas-modal';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, FooterComponent, GridProdutos, CommonModule, FormsModule, LoginModalComponent, RegistroModalComponent, MatFormFieldModule, MatInputModule, MatDatepickerModule, DetalhesProdutoModalComponent, CardapioCompletoModalComponent, MeuPerfilModalComponent, MeusPedidosModalComponent, PedidoDetalhesModalComponent, MinhasReservasModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  produtos: ItemCardapio[] = [];
  sugestaoAlmoco: ItemCardapio | null = null;
  sugestaoJantar: ItemCardapio | null = null;
  periodoSelecionado: string = 'ALMOCO';
  carregando: boolean = false;
  carregandoSugestoes: boolean = false;

  sugestaoAtual: 'ALMOCO' | 'JANTAR' = 'ALMOCO';
  temAmbasSugestoes: boolean = false;

  reservando: boolean = false;
  dataReserva: string = '';
  horarioReserva: string = '';
  numeroPessoas: number = 2;
  carregandoHorarios: boolean = false;

  dataReservaObj?: Date;
  minDate: Date = new Date();
  maxDate: Date = new Date();

  mostrarLoginModal: boolean = false;
  mostrarRegistroModal: boolean = false;

  horariosDisponiveis: string[] = [];

  todosHorarios: string[] = this.gerarTodosHorarios();

  mostrarModalReserva = false;
  reservaResumo: { data: string, horario: string, pessoas: number, mesa: any } | null = null;
  dadosConvidado = { nome: '', email: '', telefone: '' };

  mostrarModalConfirmacao = false;
  reservaConfirmada: any = null;

  mostrarModalDetalhes = false;
  itemSelecionado: ItemCardapio | null = null;

  mostrarModalCardapioCompleto = false;

  mostrarModalPerfil = false;

  mostrarModalPedidos = false;

  mostrarModalDetalhesPedido = false;
  pedidoSelecionado: Pedido | null = null;

  mostrarModalReservas = false;

  mostrarModalReservaLogado = false;

  constructor(
    private route: ActivatedRoute,
    private produtoService: ItemCardapioService,
    private sugestaoChefeService: SugestaoChefeService,
    private reservaService: ReservaService,
    private carrinhoService: CarrinhoService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.buscarProdutosPorPeriodo();
      this.buscarSugestoesChefe();
    });
  }

  abrirModalDetalhes(item: ItemCardapio) {
    this.fecharModalCardapioCompleto();

    this.itemSelecionado = item;
    this.mostrarModalDetalhes = true;
  }

  fecharModalDetalhes() {
    this.mostrarModalDetalhes = false;
    this.itemSelecionado = null;
  }

  abrirModalCardapioCompleto() {
    this.mostrarModalCardapioCompleto = true;
  }

  fecharModalCardapioCompleto() {
    this.mostrarModalCardapioCompleto = false;
  }

  abrirLogin() {
    this.fecharRegistroModal();
    this.mostrarLoginModal = true;
  }

  fecharLoginModal() {
    this.mostrarLoginModal = false;
  }

  abrirModalDetalhesPedido(pedido: Pedido) {
    this.pedidoSelecionado = pedido;
    this.fecharModalPedidos();
    this.mostrarModalDetalhesPedido = true;
  }

  fecharModalDetalhesPedido() {
    this.mostrarModalDetalhesPedido = false;
    this.pedidoSelecionado = null;
  }

  abrirModalPerfil() { this.mostrarModalPerfil = true; }
  fecharModalPerfil() { this.mostrarModalPerfil = false; }

  abrirModalPedidos() { this.mostrarModalPedidos = true; }
  fecharModalPedidos() { this.mostrarModalPedidos = false; }

  abrirModalReservas() { this.mostrarModalReservas = true; }
  fecharModalReservas() { this.mostrarModalReservas = false; }

  abrirRegistro() {
    this.fecharLoginModal();
    this.mostrarRegistroModal = true;
  }

  fecharRegistroModal() {
    this.mostrarRegistroModal = false;
  }

  buscarSugestoesChefe() {
    this.carregandoSugestoes = true;

    this.sugestaoChefeService.findSugestaoAtiva().subscribe({
      next: (sugestao) => {
        if (sugestao.itemAlmoco) {
          this.sugestaoAlmoco = {
            ...sugestao.itemAlmoco,
            urlImagem: this.produtoService.getUrlImagem(sugestao.itemAlmoco.nomeImagem),
            isSugestaoChefe: true,
            precoComDesconto: this.calcularPrecoComDesconto(sugestao.itemAlmoco.precoBase)
          };
        }

        if (sugestao.itemJantar) {
          this.sugestaoJantar = {
            ...sugestao.itemJantar,
            urlImagem: this.produtoService.getUrlImagem(sugestao.itemJantar.nomeImagem),
            isSugestaoChefe: true,
            precoComDesconto: this.calcularPrecoComDesconto(sugestao.itemJantar.precoBase)
          };
        }

        this.temAmbasSugestoes = !!this.sugestaoAlmoco && !!this.sugestaoJantar;
        if (this.sugestaoAlmoco) { this.sugestaoAtual = 'ALMOCO'; }
        else if (this.sugestaoJantar) { this.sugestaoAtual = 'JANTAR'; }
        this.carregandoSugestoes = false;
      },
      error: (err) => {
        console.error('Erro ao carregar sugestões do chefe:', err);
        this.carregandoSugestoes = false;
      }
    });
  }



  private calcularPrecoComDesconto(precoBase: number): number {
    return precoBase * 0.8;
  }

  proximaSugestao() {
    if (!this.temAmbasSugestoes) return;

    this.sugestaoAtual = this.sugestaoAtual === 'ALMOCO' ? 'JANTAR' : 'ALMOCO';
  }

  sugestaoAnterior() {
    if (!this.temAmbasSugestoes) return;

    this.sugestaoAtual = this.sugestaoAtual === 'ALMOCO' ? 'JANTAR' : 'ALMOCO';
  }

  get sugestaoExibida(): ItemCardapio | null {
    if (this.sugestaoAtual === 'ALMOCO') {
      return this.sugestaoAlmoco;
    } else {
      return this.sugestaoJantar;
    }
  }

  buscarProdutosPorPeriodo() {
    this.carregando = true;

    this.produtoService.getByPeriodo(this.periodoSelecionado).subscribe({
      next: (produtos) => {
        this.produtos = produtos.slice(0, 4).map(produto => ({
          ...produto,
          urlImagem: this.produtoService.getUrlImagem(produto.nomeImagem)
        }));

        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.carregando = false;
      }
    });
  }

  alternarPeriodo(periodo: string) {
    this.periodoSelecionado = periodo;
    this.buscarProdutosPorPeriodo();
  }

  adicionarAoCarrinho(produto: ItemCardapio) {
    if (produto) {
      console.log('Adicionar ao carrinho:', produto);
      this.carrinhoService.adicionarItem(produto);
      this.snackBar.open(`"${produto.nome}" adicionado ao carrinho!`, 'Fechar', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
    }
  }

  gerarTodosHorarios(): string[] {
    const horarios: string[] = [];
    const inicio = 19 * 60;
    const fim = 22 * 60;
    const intervalo = 15;

    for (let minuto = inicio; minuto <= fim; minuto += intervalo) {
      const horas = Math.floor(minuto / 60);
      const minutos = minuto % 60;
      horarios.push(`${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`);
    }
    return horarios;
  }

  onDadosReservaChange() {
    if (this.dataReserva && this.numeroPessoas > 0) {
      this.buscarHorariosDisponiveis();
    } else {
      this.horariosDisponiveis = [];
      this.horarioReserva = '';
    }
  }

  buscarHorariosDisponiveis() {
    // Agora não precisa mais da verificação de null nem da formatação
    if (!this.dataReserva || this.numeroPessoas <= 0) {
      return;
    }

    this.carregandoHorarios = true;
    this.horariosDisponiveis = [];
    this.horarioReserva = '';

    // Usa a data diretamente (já está no formato correto)
    this.reservaService.verificarDisponibilidade(this.dataReserva, this.numeroPessoas)
      .subscribe({
        next: (disponibilidade) => {
          const todosHorariosDisponiveis = disponibilidade.flatMap(
            disp => disp.horariosDisponiveis
          );

          this.horariosDisponiveis = [...new Set(todosHorariosDisponiveis)].sort();
          this.carregandoHorarios = false;
        },
        error: (err) => {
          console.error('Erro ao buscar horários disponíveis:', err);
          this.horariosDisponiveis = [];
          this.carregandoHorarios = false;
        }
      });
  }

  checarDisponibilidade() {
    if (!this.dataReserva || !this.horarioReserva || !this.numeroPessoas) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.reservando = true;

    // Usa a data diretamente
    this.reservaService.encontrarMesaDisponivel(this.dataReserva, this.horarioReserva, this.numeroPessoas)
      .subscribe({
        next: (mesa) => {
          if (mesa) {
            this.reservaResumo = {
              data: this.dataReserva, // Já está no formato correto
              horario: this.horarioReserva,
              pessoas: this.numeroPessoas,
              mesa: mesa
            };

            // Abre o modal correto baseado no login
            if (this.authService.isLoggedIn()) {
              this.mostrarModalReservaLogado = true;
            } else {
              this.mostrarModalReserva = true;
            }
          } else {
            alert('Não há mesas disponíveis para o horário selecionado.');
          }
          this.reservando = false;
        },
        error: (err) => {
          console.error('Erro ao encontrar mesa:', err);
          alert('Erro ao verificar disponibilidade. Tente novamente.');
          this.reservando = false;
        }
      });
  }

  private formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  confirmarReservaLogado() {
    if (!this.reservaResumo) return;

    this.reservando = true;
    const dataHora = `${this.reservaResumo.data}T${this.reservaResumo.horario}:00`;

    const dto = {
      dataHora: dataHora,
      idMesa: this.reservaResumo.mesa.id,
      numeroPessoas: this.reservaResumo.pessoas,
    };

    console.log('DTO de reserva para usuário logado:', dto);

    this.reservaService.create(dto).subscribe({
      next: (reserva) => {
        this.reservando = false;
        this.reservaConfirmada = reserva;
        this.fecharModalReserva();
        this.mostrarModalConfirmacao = true;
      },
      error: (err) => {
        this.reservando = false;
        console.error('Erro ao fazer reserva:', err);
        alert('Erro ao confirmar a reserva.');
      }
    });
  }

  fecharModalReserva() {
    this.mostrarModalReserva = false;
    this.mostrarModalReservaLogado = false;
    this.resetarFormularioReserva();
  }

  onScrollToSection(sectionId: string) {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onScrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  confirmarReservaConvidado(form: any) {
    if (form.invalid || !this.reservaResumo) return;

    this.reservando = true;

    const dataHora = `${this.reservaResumo.data}T${this.reservaResumo.horario}:00`;

    const dto = {
      dataHora: dataHora,
      idMesa: this.reservaResumo.mesa.id,
      numeroPessoas: this.reservaResumo.pessoas,
      nomeConvidado: this.dadosConvidado.nome,
      emailConvidado: this.dadosConvidado.email,
      telefoneConvidado: this.dadosConvidado.telefone
    };

    this.reservaService.createConvidado(dto).subscribe({
      next: (reserva) => {
        this.reservando = false;

        this.reservaConfirmada = reserva;
        this.fecharModalReserva();
        this.mostrarModalConfirmacao = true;
      },
      error: (err) => {
        console.error('Erro ao fazer reserva de convidado:', err);
        alert('Erro ao confirmar a reserva. Tente novamente.');
        this.reservando = false;
      }
    });
  }

  fecharModalConfirmacao() {
    this.mostrarModalConfirmacao = false;
    this.reservaConfirmada = null;
  }

  resetarFormularioReserva() {
    this.horarioReserva = '';
    this.numeroPessoas = 2;
    this.horariosDisponiveis = [];
  }

  getDataMinima(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }

  getDataMaxima(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  }

  adicionarItemDetalhes(dados: { item: ItemCardapio, quantidade: number, observacao: string }) {
    for (let i = 0; i < dados.quantidade; i++) {
      this.carrinhoService.adicionarItem(dados.item);
    }

    this.snackBar.open(`"${dados.item.nome}" adicionado ao carrinho!`, 'Fechar', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }
}