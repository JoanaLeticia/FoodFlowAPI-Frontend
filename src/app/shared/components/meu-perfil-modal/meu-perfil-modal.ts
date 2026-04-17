import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../../core/models/cliente.model';
import { AuthService } from '../../../auth/auth.service';
import { ClienteService } from '../../../core/services/user/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-meu-perfil-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.dadosPessoaisForm = this.formBuilder.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }]
    });

    this.senhaForm = this.formBuilder.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]]
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

  fecharModal() { this.close.emit(); }
}