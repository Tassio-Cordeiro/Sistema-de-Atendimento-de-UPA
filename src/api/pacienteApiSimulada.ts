import { Paciente } from "../modelos/paciente";

function esperar(milissegundos: number): Promise<void> {
    return new Promise((resolver) => {
        setTimeout(resolver, milissegundos);
    });
}

export async function carregarPacientesExternos(): Promise<Paciente[]> {
    await esperar(300);

    const respostaJson = `[
        {
            "id": "PAC-EXTERNO-001",
            "nome": "Paciente Externo",
            "idade": 35,
            "atendimentos": []
        }
    ]`;

    return JSON.parse(respostaJson) as Paciente[];
}
