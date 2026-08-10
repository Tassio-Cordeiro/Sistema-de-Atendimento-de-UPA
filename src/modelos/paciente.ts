import { Atendimento } from "./atendimento";

export interface Paciente {
    id: string;
    nome: string;
    idade: number;
    atendimentos: Atendimento[];
}
