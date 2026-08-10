import { createInterface } from "readline/promises";
import { stdin as entradaPadrao, stdout as saidaPadrao } from "process";
import { Prioridade, Atendimento } from "./modelos/atendimento";
import {
    alterarPrioridade,
    criarAtendimento,
    finalizarAtendimento,
    iniciarAtendimento
} from "./servicos/atendimentoServico";
import { calcularEstatisticas } from "./servicos/estatisticaServico";
import { obterFilaAtual } from "./servicos/filaServico";
import {
    buscarPacientePorId,
    cadastrarPaciente,
    listarAtendimentosDePaciente
} from "./servicos/pacienteServico";

const terminal = createInterface({
    input: entradaPadrao,
    output: saidaPadrao
});

const prioridades: Prioridade[] = [
    "VERMELHO",
    "LARANJA",
    "AMARELO",
    "VERDE",
    "AZUL"
];

async function perguntar(texto: string): Promise<string> {
    const resposta = await terminal.question(texto);
    return resposta.trim();
}

function exibirMenu(): void {
    console.log(`
====================================
   SISTEMA DE TRIAGEM - UPA
====================================

1 - Cadastrar paciente
2 - Buscar paciente
3 - Criar atendimento
4 - Visualizar fila
5 - Alterar prioridade
6 - Iniciar atendimento
7 - Finalizar atendimento
8 - Consultar histórico
9 - Visualizar estatísticas
0 - Sair
`);
}

function exibirPrioridades(): void {
    console.log("\nPrioridades:");
    prioridades.forEach((prioridade, indice) => {
        console.log(`${indice + 1} - ${prioridade}`);
    });
}

async function perguntarPrioridade(texto: string): Promise<Prioridade> {
    exibirPrioridades();

    const escolha = await perguntar(texto);
    const indice = Number(escolha) - 1;
    const prioridade = prioridades[indice];

    if (prioridade === undefined) {
        throw new Error("Prioridade inválida.");
    }

    return prioridade;
}

function converterSintomas(entradaSintomas: string): string[] {
    return entradaSintomas
        .split(",")
        .map((sintoma) => sintoma.trim())
        .filter((sintoma) => sintoma.length > 0);
}

function exibirAtendimento(atendimento: Atendimento): void {
    console.log(`Atendimento: ${atendimento.id}`);
    console.log(`Status: ${atendimento.status}`);
    console.log(`Prioridade: ${atendimento.prioridade}`);
    console.log(`Chegada: ${atendimento.dataChegada}`);

    if (atendimento.dataFinalizacao !== undefined) {
        console.log(`Finalização: ${atendimento.dataFinalizacao}`);
    }

    console.log(`Sintomas: ${atendimento.sintomas.join(", ")}`);

    if (atendimento.historicoPrioridade.length > 0) {
        console.log("Histórico de prioridade:");
        atendimento.historicoPrioridade.forEach((alteracao) => {
            console.log(
                `  ${alteracao.prioridadeAnterior} -> ${alteracao.novaPrioridade} em ${alteracao.data}`
            );
            console.log(`  Motivo: ${alteracao.motivo}`);
        });
    }
}

async function cadastrarPacientePeloTerminal(): Promise<void> {
    const nome = await perguntar("Nome: ");
    const idade = Number(await perguntar("Idade: "));
    const paciente = await cadastrarPaciente(nome, idade);

    console.log("\nPaciente cadastrado com sucesso.");
    console.log(`ID: ${paciente.id}`);
}

async function buscarPacientePeloTerminal(): Promise<void> {
    const idPaciente = await perguntar("ID do paciente: ");
    const paciente = await buscarPacientePorId(idPaciente);

    if (paciente === undefined) {
        console.log("\nPaciente não encontrado.");
        return;
    }

    console.log(`\nID: ${paciente.id}`);
    console.log(`Nome: ${paciente.nome}`);
    console.log(`Idade: ${paciente.idade}`);
    console.log(`Quantidade de atendimentos: ${paciente.atendimentos.length}`);
}

async function criarAtendimentoPeloTerminal(): Promise<void> {
    const idPaciente = await perguntar("ID do paciente: ");
    const paciente = await buscarPacientePorId(idPaciente);

    if (paciente === undefined) {
        console.log("\nPaciente não encontrado.");
        return;
    }

    const sintomas = converterSintomas(await perguntar("Sintomas: "));
    const prioridade = await perguntarPrioridade("Escolha a prioridade: ");
    const atendimento = await criarAtendimento(paciente, sintomas, prioridade);

    console.log("\nAtendimento criado com sucesso.");
    console.log(`ID: ${atendimento.id}`);
    console.log(`Status: ${atendimento.status}`);
}

async function visualizarFilaPeloTerminal(): Promise<void> {
    const fila = await obterFilaAtual();

    console.log("\nFILA DE ATENDIMENTO\n");

    if (fila.length === 0) {
        console.log("Não há atendimentos aguardando.");
        return;
    }

    fila.forEach((item, indice) => {
        console.log(`${indice + 1} - ${item.paciente.nome}`);
        console.log(`    Atendimento: ${item.atendimento.id}`);
        console.log(`    Prioridade: ${item.atendimento.prioridade}`);
        console.log(`    Chegada: ${item.atendimento.dataChegada}`);
        console.log("");
    });
}

async function alterarPrioridadePeloTerminal(): Promise<void> {
    const idPaciente = await perguntar("ID do paciente: ");
    const idAtendimento = await perguntar("ID do atendimento: ");
    const novaPrioridade = await perguntarPrioridade("Escolha a nova prioridade: ");
    const motivo = await perguntar("Motivo: ");
    const atendimento = await alterarPrioridade(
        idPaciente,
        idAtendimento,
        novaPrioridade,
        motivo
    );

    console.log("\nPrioridade alterada com sucesso.");
    console.log(`Prioridade atual: ${atendimento.prioridade}`);
}

async function iniciarAtendimentoPeloTerminal(): Promise<void> {
    const idPaciente = await perguntar("ID do paciente: ");
    const idAtendimento = await perguntar("ID do atendimento: ");
    const atendimento = await iniciarAtendimento(idPaciente, idAtendimento);

    console.log("\nAtendimento iniciado com sucesso.");
    console.log(`Status: ${atendimento.status}`);
}

async function finalizarAtendimentoPeloTerminal(): Promise<void> {
    const idPaciente = await perguntar("ID do paciente: ");
    const idAtendimento = await perguntar("ID do atendimento: ");
    const atendimento = await finalizarAtendimento(idPaciente, idAtendimento);

    console.log("\nAtendimento finalizado com sucesso.");
    console.log(`Status: ${atendimento.status}`);
    console.log(`Finalização: ${atendimento.dataFinalizacao}`);
}

async function consultarHistoricoPeloTerminal(): Promise<void> {
    const idPaciente = await perguntar("ID do paciente: ");
    const atendimentos = await listarAtendimentosDePaciente(idPaciente);
    const historico = atendimentos.filter(
        (atendimento) =>
            atendimento.status === "FINALIZADO" || atendimento.status === "CANCELADO"
    );

    console.log("\nHISTÓRICO DE ATENDIMENTOS\n");

    if (historico.length === 0) {
        console.log("Não há atendimentos finalizados ou cancelados para este paciente.");
        return;
    }

    historico.forEach((atendimento, indice) => {
        console.log(`${indice + 1} - ${atendimento.id}`);
        exibirAtendimento(atendimento);
        console.log("");
    });
}

async function visualizarEstatisticasPeloTerminal(): Promise<void> {
    const estatisticas = await calcularEstatisticas();

    console.log("\nESTATÍSTICAS\n");
    console.log(`Total de pacientes cadastrados: ${estatisticas.totalPacientesCadastrados}`);
    console.log(`Total de atendimentos: ${estatisticas.totalAtendimentos}`);
    console.log(`Atendimentos aguardando: ${estatisticas.totalAtendimentosAguardando}`);
    console.log(`Atendimentos em andamento: ${estatisticas.totalAtendimentosEmAndamento}`);
    console.log(`Atendimentos finalizados: ${estatisticas.totalAtendimentosFinalizados}`);
    console.log("Quantidade por prioridade:");

    prioridades.forEach((prioridade) => {
        console.log(`  ${prioridade}: ${estatisticas.atendimentosPorPrioridade[prioridade]}`);
    });
}

async function executarOpcao(opcao: string): Promise<boolean> {
    switch (opcao) {
        case "1":
            await cadastrarPacientePeloTerminal();
            return true;
        case "2":
            await buscarPacientePeloTerminal();
            return true;
        case "3":
            await criarAtendimentoPeloTerminal();
            return true;
        case "4":
            await visualizarFilaPeloTerminal();
            return true;
        case "5":
            await alterarPrioridadePeloTerminal();
            return true;
        case "6":
            await iniciarAtendimentoPeloTerminal();
            return true;
        case "7":
            await finalizarAtendimentoPeloTerminal();
            return true;
        case "8":
            await consultarHistoricoPeloTerminal();
            return true;
        case "9":
            await visualizarEstatisticasPeloTerminal();
            return true;
        case "0":
            console.log("\nSistema encerrado.");
            return false;
        default:
            console.log("\nOpção inválida.");
            return true;
    }
}

async function iniciarMenu(): Promise<void> {
    let deveContinuar = true;

    while (deveContinuar) {
        exibirMenu();
        const opcao = await perguntar("Escolha uma opção: ");

        try {
            deveContinuar = await executarOpcao(opcao);
        } catch (erro) {
            const mensagem = erro instanceof Error ? erro.message : "Erro inesperado.";
            console.log(`\n${mensagem}`);
        }

        if (deveContinuar) {
            await perguntar("\nPressione Enter para continuar...");
        }
    }

    terminal.close();
}

iniciarMenu().catch((erro: Error) => {
    console.error("Erro ao iniciar o sistema:", erro.message);
    terminal.close();
});
