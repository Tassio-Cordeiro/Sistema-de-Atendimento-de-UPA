import { Prioridade } from "../modelos/atendimento";
import { lerPacientes } from "../repositorios/pacienteRepositorio";

export interface EstatisticasAtendimento {
    totalPacientesCadastrados: number;
    totalAtendimentos: number;
    totalAtendimentosAguardando: number;
    totalAtendimentosEmAndamento: number;
    totalAtendimentosFinalizados: number;
    atendimentosPorPrioridade: Record<Prioridade, number>;
}

function criarContadorPrioridades(): Record<Prioridade, number> {
    return {
        VERMELHO: 0,
        LARANJA: 0,
        AMARELO: 0,
        VERDE: 0,
        AZUL: 0
    };
}

export async function calcularEstatisticas(): Promise<EstatisticasAtendimento> {
    const pacientes = await lerPacientes();
    const atendimentos = pacientes.flatMap((paciente) => paciente.atendimentos);

    return {
        totalPacientesCadastrados: pacientes.length,
        totalAtendimentos: atendimentos.length,
        totalAtendimentosAguardando: atendimentos.filter(
            (atendimento) => atendimento.status === "AGUARDANDO"
        ).length,
        totalAtendimentosEmAndamento: atendimentos.filter(
            (atendimento) => atendimento.status === "EM_ATENDIMENTO"
        ).length,
        totalAtendimentosFinalizados: atendimentos.filter(
            (atendimento) => atendimento.status === "FINALIZADO"
        ).length,
        atendimentosPorPrioridade: atendimentos.reduce((contador, atendimento) => {
            contador[atendimento.prioridade] += 1;
            return contador;
        }, criarContadorPrioridades())
    };
}
