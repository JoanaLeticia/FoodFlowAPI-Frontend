import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../../core/models/cliente.model';
import { AuthService } from '../../../auth/auth.service';
import { ClienteService } from '../../../core/services/user/cliente.service';
import { EnderecoService } from '../../../core/services/utils/endereco.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TelefoneService } from '../../../core/services/utils/telefone.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-meu-perfil-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './meu-perfil-modal.html',
  styleUrls: ['./meu-perfil-modal.css']
})
export class MeuPerfilModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  abaSelecionada: 'dados' | 'enderecos' | 'telefones' = 'dados';
  cliente: Cliente | null = null;
  dadosPessoaisForm!: FormGroup;
  senhaForm!: FormGroup;
  salvando = false;

  enderecoForm!: FormGroup;
  mostrandoFormEndereco = false;

  telefoneForm!: FormGroup;
  mostrandoFormTelefone = false;

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private enderecoService: EnderecoService,
    private telefoneService: TelefoneService
  ) { }

  ngOnInit(): void {
    this.dadosPessoaisForm = this.formBuilder.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }]
    });

    this.senhaForm = this.formBuilder.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.enderecoForm = this.formBuilder.group({
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      bairro: ['', Validators.required],
      cep: ['', Validators.required],
      idMunicipio: ['', Validators.required]
    });

    this.telefoneForm = this.formBuilder.group({
      codArea: ['', [Validators.required, Validators.maxLength(3)]],
      numero: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]]
    });

    this.carregarDadosCliente();
  }

  carregarDadosCliente() {
    this.authService.getClienteCompleto().subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        if (cliente) {
          this.dadosPessoaisForm.patchValue({
            nome: cliente.nome,
            email: cliente.email
          });
        }
      },
      error: (err) => console.error('Erro ao carregar dados do cliente', err)
    });
  }

  selecionarAba(aba: 'dados' | 'enderecos' | 'telefones') {
    this.abaSelecionada = aba;
  }

  salvarDadosPessoais() {
    if (this.dadosPessoaisForm.invalid || !this.cliente) return;

    this.salvando = true;
    const dados = { nome: this.dadosPessoaisForm.value.nome };

    this.clienteService.updateParcial(dados, this.cliente.id).subscribe({
      next: () => {
        this.snackBar.open('Dados atualizados com sucesso!', 'Fechar', { duration: 3000 });
        this.salvando = false;
        this.authService.getUsuariologadoSnapshot()!.nome = dados.nome; // Atualiza o nome localmente
      },
      error: (err) => {
        this.snackBar.open('Erro ao atualizar dados.', 'Fechar', { duration: 3000 });
        this.salvando = false;
        console.error(err);
      }
    });
  }

  salvarSenha() {
    if (this.senhaForm.invalid) return;

    this.salvando = true;
    const { senhaAtual, novaSenha } = this.senhaForm.value;

    this.clienteService.alterarSenha(senhaAtual, novaSenha).subscribe({
      next: () => {
        this.snackBar.open('Senha alterada com sucesso!', 'Fechar', { duration: 3000 });
        this.senhaForm.reset();
        this.salvando = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao alterar senha.', 'Fechar', { duration: 3000 });
        this.salvando = false;
        console.error(err);
      }
    });
  }

  abrirFormEndereco() {
    this.enderecoForm.reset();
    this.mostrandoFormEndereco = true;
  }

  cancelarFormEndereco() {
    this.mostrandoFormEndereco = false;
  }

  salvarNovoEndereco() {
    if (this.enderecoForm.invalid || !this.cliente) return;

    this.salvando = true;

    let cepFormatado = this.enderecoForm.value.cep;
    if (cepFormatado.length === 8 && !cepFormatado.includes('-')) {
      cepFormatado = cepFormatado.substring(0, 5) + '-' + cepFormatado.substring(5);
    }

    const novoEnderecoDTO = {
      ...this.enderecoForm.value,
      cep: cepFormatado,
      idCliente: this.cliente.id
    };

    this.enderecoService.insert(novoEnderecoDTO).subscribe({
      next: () => {
        this.snackBar.open('Endereço adicionado com sucesso!', 'Fechar', { duration: 3000 });
        this.carregarDadosCliente();
        this.mostrandoFormEndereco = false;
        this.salvando = false;
      },
      error: (err) => {
        this.snackBar.open('Erro ao adicionar endereço.', 'Fechar', { duration: 3000 });
        this.salvando = false;
        console.error(err);
      }
    });
  }

  abrirFormTelefone() {
    this.telefoneForm.reset();
    this.mostrandoFormTelefone = true;
  }

  cancelarFormTelefone() {
    this.mostrandoFormTelefone = false;
  }

  salvarNovoTelefone() {
    if (this.telefoneForm.invalid || !this.cliente) return;

    this.salvando = true;

    // Monta o objeto com os dados do formulário + ID do cliente logado
    const novoTelefone = {
      ...this.telefoneForm.value,
      idCliente: this.cliente.id
    };

    // Dispara a requisição para o backend
    this.telefoneService.insert(novoTelefone as any).subscribe({
      next: () => {
        this.snackBar.open('Telefone adicionado com sucesso!', 'Fechar', { duration: 3000 });
        this.carregarDadosCliente();
        this.mostrandoFormTelefone = false;
        this.salvando = false;
      },
      error: (err) => {
        this.snackBar.open('Erro ao adicionar telefone.', 'Fechar', { duration: 3000 });
        this.salvando = false;
        console.error(err);
      }
    });
  }

  excluirEndereco(id: number) {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      this.salvando = true;
      this.enderecoService.delete({ id } as any).subscribe({
        next: () => {
          this.snackBar.open('Endereço excluído!', 'Fechar', { duration: 3000 });
          this.carregarDadosCliente();
          this.salvando = false;
        },
        error: (err) => {
          const mensagem = err.error?.Erro || 'Erro ao excluir endereço.';
          this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
          this.salvando = false;
        }
      });
    }
  }

  excluirTelefone(id: number) {
    if (confirm('Tem certeza que deseja excluir este telefone?')) {
      this.salvando = true;
      this.telefoneService.delete({ id } as any).subscribe({
        next: () => {
          this.snackBar.open('Telefone excluído!', 'Fechar', { duration: 3000 });
          this.carregarDadosCliente();
          this.salvando = false;
        },
        error: (err) => {
          this.snackBar.open('Erro ao excluir telefone.', 'Fechar', { duration: 3000 });
          this.salvando = false;
        }
      });
    }
  }

  fecharModal() { this.close.emit(); }
}