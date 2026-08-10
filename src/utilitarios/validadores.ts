import { Prioridade } from "../modelos/atendimento";

const prioridadesValidas: readonly Prioridade[] = [
    "VERMELHO",
    "LARANJA",
    "AMARELO",
    "VERDE",
    "AZUL"
];

export function validarNome(nome: string): void {
    if (nome.trim().length === 0) {
        throw new Error("Nome do paciente não pode ser vazio.");
    }
}

export function validarIdade(idade: number): void {
    if (!Number.isFinite(idade) || idade < 0) {
        throw new Error("Idade deve ser um número maior ou igual a zero.");
    }
}

export function validarSintomas(sintomas: string[]): void {
    const possuiSintomaValido = sintomas.some((sintoma) => sintoma.trim().length > 0);

    if (!possuiSintomaValido) {
        throw new Error("A lista de sintomas deve possuir pelo menos um item válido.");
    }
}

export function validarPrioridade(prioridade: Prioridade): void {
    if (!prioridadesValidas.includes(prioridade)) {
        throw new Error("Prioridade inválida.");
    }
}

export function validarMotivo(motivo: string): void {
    if (motivo.trim().length === 0) {
        throw new Error("Motivo da alteração de prioridade não pode ser vazio.");
    }
}

export function garantirRegistroEncontrado<T>(
    registro: T | undefined,
    mensagemErro: string
): T {
    if (registro === undefined) {
        throw new Error(mensagemErro);
    }

    return registro;
}
