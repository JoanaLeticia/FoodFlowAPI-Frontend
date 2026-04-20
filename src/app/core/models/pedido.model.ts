import { Atendimento } from "./atendimento.model";
import { Cliente } from "./cliente.model";
import { Endereco } from "./endereco.model";
import { ItemCardapio } from "./item-cardapio.model";
import { StatusPedido } from "./status-pedido.model";
import { TipoPeriodo } from "./tipo-periodo.model";

export interface Pedido {
  id: number;
  dataPedido: string;
  status: string;
  valorTotal: number;
  subtotal?: number;
  taxaEntrega?: number;
  itens?: any[];
  itensPedido?: any[];
  atendimento?: any;
}