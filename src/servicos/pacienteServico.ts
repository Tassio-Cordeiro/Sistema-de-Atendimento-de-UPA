import { Paciente } from "../modelos/paciente";
import { Atendimento, Prioridade } from "../modelos/atendimento";
import { lerPacientes, salvarPacientes } from "../repositorios/pacienteRepositorio";
import {
    garantirRegistroEncontrado,
    validarIdade,
    validarNome,
    validarPrioridade
} from "../utilitarios/validadores";

function obterNumeroDoId(id: string): number {
    const partes = id.split("-");
    const numero = Number(partes[1] ?? "0");
    return Number.isFinite(numero) ? numero : 0;
}

function gerarProximoIdPaciente(pacientes: Paciente[]): string {
    const maiorNumero = pacientes.reduce(
        (maior, paciente) => Math.max(maior, obterNumeroDoId(paciente.id)),
        0
    );

    return `PAC-${String(maiorNumero + 1).padStart(3, "0")}`;
}

export async function cadastrarPaciente(nome: string, idade: number): Promise<Paciente> {
    validarNome(nome);
    validarIdade(idade);

    const pacientes = await lerPacientes();
    const novoPaciente: Paciente = {
        id: gerarProximoIdPaciente(pacientes),
        nome: nome.trim(),
        idade,
        atendimentos: []
    };

    pacientes.push(novoPaciente);
    await salvarPacientes(pacientes);

    return novoPaciente;
}

export async function listarPacientes(): Promise<Paciente[]> {
    return lerPacientes();
}

export async function buscarPacientePorId(idPaciente: string): Promise<Paciente | undefined> {
    const pacientes = await lerPacientes();
    return pacientes.find((paciente) => paciente.id === idPaciente);
}

export async function buscarPacientePorNome(nome: string): Promise<Paciente[]> {
    const pacientes = await lerPacientes();
    const nomeNormalizado = nome.trim().toLocaleLowerCase("pt-BR");

    return pacientes.filter((paciente) =>
        paciente.nome.toLocaleLowerCase("pt-BR").includes(nomeNormalizado)
    );
}

export async function listarAtendimentosDePaciente(idPaciente: string): Promise<Atendimento[]> {
    const pacientes = await lerPacientes();
    const paciente = garantirRegistroEncontrado(
        pacientes.find((item) => item.id === idPaciente),
        `Paciente ${idPaciente} não encontrado.`
    );

    return paciente.atendimentos;
}

export async function listarAtendimentosPorPrioridade(
    prioridade: Prioridade
): Promise<Atendimento[]> {
    validarPrioridade(prioridade);

    const pacientes = await lerPacientes();

    return pacientes.flatMap((paciente) =>
        paciente.atendimentos.filter((atendimento) => atendimento.prioridade === prioridade)
    );
}

export async function listarAtendimentosFinalizados(): Promise<Atendimento[]> {
    const pacientes = await lerPacientes();

    return pacientes.flatMap((paciente) =>
        paciente.atendimentos.filter((atendimento) => atendimento.status === "FINALIZADO")
    );
}
