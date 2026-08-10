import { promises as arquivos } from "fs";
import path from "path";
import { Paciente } from "../modelos/paciente";

const caminhoArquivoPacientes = path.join(process.cwd(), "src", "dados", "pacientes.json");

async function garantirArquivoPacientes(): Promise<void> {
    await arquivos.mkdir(path.dirname(caminhoArquivoPacientes), { recursive: true });

    try {
        await arquivos.access(caminhoArquivoPacientes);
    } catch {
        await arquivos.writeFile(caminhoArquivoPacientes, "[]", "utf-8");
    }
}

export async function lerPacientes(): Promise<Paciente[]> {
    await garantirArquivoPacientes();

    const conteudo = await arquivos.readFile(caminhoArquivoPacientes, "utf-8");
    const texto = conteudo.trim();

    if (texto.length === 0) {
        return [];
    }

    return JSON.parse(texto) as Paciente[];
}

export async function salvarPacientes(pacientes: Paciente[]): Promise<void> {
    await garantirArquivoPacientes();
    await arquivos.writeFile(
        caminhoArquivoPacientes,
        JSON.stringify(pacientes, null, 4),
        "utf-8"
    );
}

export async function buscarPacientePorId(idPaciente: string): Promise<Paciente | undefined> {
    const pacientes = await lerPacientes();
    return pacientes.find((paciente) => paciente.id === idPaciente);
}
