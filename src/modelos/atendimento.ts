export type Prioridade =
    | "VERMELHO"
    | "LARANJA"
    | "AMARELO"
    | "VERDE"
    | "AZUL";

export type StatusAtendimento =
    | "AGUARDANDO"
    | "EM_ATENDIMENTO"
    | "FINALIZADO"
    | "CANCELADO";

export interface AlteracaoPrioridade {
    prioridadeAnterior: Prioridade;
    novaPrioridade: Prioridade;
    data: string;
    motivo: string;
}

export interface Atendimento {
    id: string;
    dataChegada: string;
    dataFinalizacao?: string;
    sintomas: string[];
    prioridade: Prioridade;
    status: StatusAtendimento;
    historicoPrioridade: AlteracaoPrioridade[];
}
