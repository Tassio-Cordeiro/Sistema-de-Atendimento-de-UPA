import { Atendimento, Prioridade } from "../modelos/atendimento";
import { Paciente } from "../modelos/paciente";
import { lerPacientes } from "../repositorios/pacienteRepositorio";

export interface ItemFilaAtendimento {
    paciente: Paciente;
    atendimento: Atendimento;
}

const pesoPrioridade: Record<Prioridade, number> = {
    VERMELHO: 5,
    LARANJA: 4,
    AMARELO: 3,
    VERDE: 2,
    AZUL: 1
};

export async function obterFilaAtual(): Promise<ItemFilaAtendimento[]> {
    const pacientes = await lerPacientes();

    return pacientes
        .flatMap((paciente) =>
            paciente.atendimentos
                .filter((atendimento) => atendimento.status === "AGUARDANDO")
                .map((atendimento) => ({ paciente, atendimento }))
        )
        .sort((primeiro, segundo) => {
            const diferencaPrioridade =
                pesoPrioridade[segundo.atendimento.prioridade] -
                pesoPrioridade[primeiro.atendimento.prioridade];

            if (diferencaPrioridade !== 0) {
                return diferencaPrioridade;
            }

            return (
                new Date(primeiro.atendimento.dataChegada).getTime() -
                new Date(segundo.atendimento.dataChegada).getTime()
            );
        });
}
