import { Atendimento, Prioridade } from "../modelos/atendimento";
import { Paciente } from "../modelos/paciente";
import { lerPacientes, salvarPacientes } from "../repositorios/pacienteRepositorio";
import {
    garantirRegistroEncontrado,
    validarMotivo,
    validarPrioridade,
    validarSintomas
} from "../utilitarios/validadores";

function obterNumeroDoId(id: string): number {
    const partes = id.split("-");
    const numero = Number(partes[1] ?? "0");
    return Number.isFinite(numero) ? numero : 0;
}

function gerarProximoIdAtendimento(atendimentos: Atendimento[]): string {
    const maiorNumero = atendimentos.reduce(
        (maior, atendimento) => Math.max(maior, obterNumeroDoId(atendimento.id)),
        0
    );

    return `ATD-${String(maiorNumero + 1).padStart(3, "0")}`;
}

export async function criarAtendimento(
    paciente: Paciente,
    sintomas: string[],
    prioridade: Prioridade
): Promise<Atendimento> {
    validarSintomas(sintomas);
    validarPrioridade(prioridade);

    const pacientes = await lerPacientes();
    const pacienteCadastrado = garantirRegistroEncontrado(
        pacientes.find((item) => item.id === paciente.id),
        `Paciente ${paciente.id} não encontrado.`
    );
    const todosAtendimentos = pacientes.flatMap((item) => item.atendimentos);

    const novoAtendimento: Atendimento = {
        id: gerarProximoIdAtendimento(todosAtendimentos),
        dataChegada: new Date().toISOString(),
        sintomas: sintomas.map((sintoma) => sintoma.trim()).filter((sintoma) => sintoma.length > 0),
        prioridade,
        status: "AGUARDANDO",
        historicoPrioridade: []
    };

    pacienteCadastrado.atendimentos.push(novoAtendimento);
    await salvarPacientes(pacientes);

    return novoAtendimento;
}

export async function alterarPrioridade(
    idPaciente: string,
    idAtendimento: string,
    novaPrioridade: Prioridade,
    motivo: string
): Promise<Atendimento> {
    validarPrioridade(novaPrioridade);
    validarMotivo(motivo);

    const pacientes = await lerPacientes();
    const paciente = garantirRegistroEncontrado(
        pacientes.find((item) => item.id === idPaciente),
        `Paciente ${idPaciente} não encontrado.`
    );
    const atendimento = garantirRegistroEncontrado(
        paciente.atendimentos.find((item) => item.id === idAtendimento),
        `Atendimento ${idAtendimento} não encontrado.`
    );

    if (atendimento.prioridade !== novaPrioridade) {
        atendimento.historicoPrioridade.push({
            prioridadeAnterior: atendimento.prioridade,
            novaPrioridade,
            data: new Date().toISOString(),
            motivo: motivo.trim()
        });
        atendimento.prioridade = novaPrioridade;
        await salvarPacientes(pacientes);
    }

    return atendimento;
}

export async function iniciarAtendimento(
    idPaciente: string,
    idAtendimento: string
): Promise<Atendimento> {
    const pacientes = await lerPacientes();
    const paciente = garantirRegistroEncontrado(
        pacientes.find((item) => item.id === idPaciente),
        `Paciente ${idPaciente} não encontrado.`
    );
    const atendimento = garantirRegistroEncontrado(
        paciente.atendimentos.find((item) => item.id === idAtendimento),
        `Atendimento ${idAtendimento} não encontrado.`
    );

    if (atendimento.status !== "AGUARDANDO") {
        throw new Error("Somente atendimentos aguardando podem ser iniciados.");
    }

    atendimento.status = "EM_ATENDIMENTO";
    await salvarPacientes(pacientes);

    return atendimento;
}

export async function finalizarAtendimento(
    idPaciente: string,
    idAtendimento: string
): Promise<Atendimento> {
    const pacientes = await lerPacientes();
    const paciente = garantirRegistroEncontrado(
        pacientes.find((item) => item.id === idPaciente),
        `Paciente ${idPaciente} não encontrado.`
    );
    const atendimento = garantirRegistroEncontrado(
        paciente.atendimentos.find((item) => item.id === idAtendimento),
        `Atendimento ${idAtendimento} não encontrado.`
    );

    if (atendimento.status !== "EM_ATENDIMENTO") {
        throw new Error("Somente atendimentos em atendimento podem ser finalizados.");
    }

    atendimento.status = "FINALIZADO";
    atendimento.dataFinalizacao = new Date().toISOString();
    await salvarPacientes(pacientes);

    return atendimento;
}
