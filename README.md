# Sistema de Triagem e Gerenciamento de Atendimento para UPA

Projeto desenvolvido em **TypeScript** com execução em **Node.js**, com o objetivo de simular o processo de cadastro de pacientes, criação de atendimentos, gerenciamento da fila de triagem, alteração de prioridade, finalização dos atendimentos e geração de estatísticas.

Toda a interação é realizada por meio do terminal.

O projeto não utiliza banco de dados, os dados são persistidos localmente em um arquivo JSON.


# Estrutura do projeto

```text
src/
│
├── modelos/
│   ├── paciente.ts
│   └── atendimento.ts
│
├── dados/
│   └── pacientes.json
│
├── repositorios/
│   └── pacienteRepositorio.ts
│
├── servicos/
│   ├── pacienteServico.ts
│   ├── atendimentoServico.ts
│   ├── filaServico.ts
│   └── estatisticaServico.ts
│
├── utilitarios/
│   └── validadores.ts
│
├── api/
│   └── pacienteApiSimulada.ts
│
└── index.ts
```

A organização foi criada para separar as responsabilidades do sistema de forma modular.

* `modelos`: definição das estruturas e tipos utilizados pelo sistema;
* `repositorios`: leitura e gravação dos pacientes no arquivo JSON;
* `servicos`: regras de negócio;
* `utilitarios`: funções auxiliares e validações;
* `api`: simulação de comunicação assíncrona;
* `index.ts`: interação com o usuário através do terminal.

---

## R01 — Cadastro e gerenciamento de pacientes

O sistema permite cadastrar pacientes contendo inicialmente:

* identificador;
* nome;
* idade;
* atendimentos.

Foi decidido separar os dados permanentes do paciente dos dados relacionados a uma passagem pela UPA.

Por esse motivo, sintomas, prioridade e data de chegada pertencem ao objeto `Atendimento`, e não diretamente ao objeto `Paciente`.

Um paciente pode possuir vários atendimentos.

Exemplo conceitual:

```text
Paciente
│
├── id
├── nome
├── idade
│
└── atendimentos[]
```

A função `cadastrarPaciente()` é responsável pelo cadastro.

Também existe consulta de pacientes por identificador.

No terminal, essas funcionalidades estão disponíveis nas opções:

```text
1 - Cadastrar paciente
2 - Buscar paciente
```

Essa separação permite que o mesmo paciente retorne à UPA em outro momento sem que seja necessário criar uma nova pessoa no sistema.

---

## R02 — Organização das funcionalidades do sistema


O sistema foi dividido em módulos independentes.

As responsabilidades foram separadas entre modelos, repositórios, serviços, utilitários e interface de terminal.

Por exemplo:

```text
index.ts
      ↓
pacienteServico.ts
      ↓
pacienteRepositorio.ts
      ↓
pacientes.json
```

O arquivo `index.ts` não acessa diretamente o JSON.

Ele recebe as informações digitadas pelo usuário e chama as funções responsáveis pelas regras de negócio.

Foram utilizadas importações e exportações entre os módulos.

Exemplo de funções organizadas em módulos:

```typescript
cadastrarPaciente()
buscarPacientePorId()

criarAtendimento()
alterarPrioridade()
iniciarAtendimento()
finalizarAtendimento()

obterFilaAtual()

calcularEstatisticas()
```

Essa divisão evita concentrar todo o funcionamento da aplicação em um único arquivo.

---

## R03 — Classificação e gerenciamento da fila de atendimento


Cada atendimento possui uma prioridade:

```text
VERMELHO
LARANJA
AMARELO
VERDE
AZUL
```

A prioridade é informada durante a triagem.

O sistema não determina automaticamente uma prioridade com base nos sintomas, pois o projeto possui finalidade exclusivamente acadêmica e não pretende implementar um protocolo médico real.

A fila considera somente atendimentos com status:

```text
AGUARDANDO
```

A ordenação respeita duas regras:

1. maior prioridade primeiro;
2. entre pacientes com a mesma prioridade, quem chegou primeiro permanece primeiro.

Também foram utilizadas estruturas de controle estudadas durante a disciplina.

O menu utiliza:

```typescript
switch
```

para determinar qual funcionalidade será executada.

O programa permanece ativo utilizando uma estrutura de repetição:

```typescript
while
```

até que o usuário selecione:

```text
0 - Sair
```

Também são utilizadas estruturas `if` para validações e decisões durante o fluxo da aplicação.

---

## R04 — Consulta, busca e geração de estatísticas


O sistema possui operações para:

* buscar pacientes;
* listar atendimentos;
* consultar histórico;
* visualizar a fila;
* calcular estatísticas.



### `map()`

É utilizado, por exemplo, durante o tratamento da entrada dos sintomas.

Uma entrada:

```text
Febre, dor de cabeça, náusea
```

é transformada em um array de sintomas.

### `filter()`

É utilizado para selecionar somente determinados registros.

Por exemplo, na consulta ao histórico são selecionados os atendimentos com status:

```text
FINALIZADO
CANCELADO
```

### `join()`

É utilizado para apresentar o array de sintomas como texto no terminal.

Exemplo:

```typescript
atendimento.sintomas.join(", ")
```

### Outros métodos

Antes da entrega final é necessário verificar no código a utilização de:

```typescript
find()
some()
reduce()
```

Caso algum desses métodos ainda não esteja presente, ele deverá ser utilizado em uma funcionalidade adequada do sistema.

Possíveis aplicações:

* `find()` para localização de paciente ou atendimento;
* `some()` para verificar a existência de determinados atendimentos;
* `reduce()` para geração das estatísticas.

O objetivo é utilizar esses métodos onde fizerem sentido, e não apenas adicioná-los artificialmente para cumprir o requisito.

---

## R05 — Modelagem das entidades do sistema

O sistema utiliza estruturas tipadas para representar as entidades do domínio.

As principais entidades são:

```text
Paciente
Atendimento
AlteracaoPrioridade
```

Também foram definidos tipos específicos para informações com valores controlados.

Exemplo:

```typescript
type Prioridade =
    | "VERMELHO"
    | "LARANJA"
    | "AMARELO"
    | "VERDE"
    | "AZUL";
```

E:

```typescript
type StatusAtendimento =
    | "AGUARDANDO"
    | "EM_ATENDIMENTO"
    | "FINALIZADO"
    | "CANCELADO";
```

Isso impede que valores arbitrários sejam atribuídos a essas propriedades.

O paciente possui um array de atendimentos:

```typescript
atendimentos: Atendimento[];
```

Cada atendimento também possui um array para registrar alterações de prioridade.

Foi utilizada uma propriedade opcional para representar a data de finalização:

```typescript
dataFinalizacao?: string;
```

Isso acontece porque um atendimento que ainda está aguardando ou em andamento não possui uma data de finalização.

---

## R06 — Simulação de comunicação com uma API


Foi criado o módulo:

```text
src/api/pacienteApiSimulada.ts
```

Seu objetivo é simular o recebimento de informações de uma fonte externa.

Não foi criada uma API HTTP real, pois o requisito solicita somente uma simulação.

A implementação utiliza conceitos como:

```typescript
Promise
async
await
JSON
```

e retorno tipado.

Essa funcionalidade é mantida separada da persistência principal da aplicação.

O arquivo `pacientes.json` representa os dados locais do sistema, enquanto `pacienteApiSimulada.ts` representa uma possível comunicação externa.


---

# RA01 — Validação utilizando Expressões Regulares

### Status: Pendente

Nesta primeira versão foram implementadas apenas validações básicas, como:

* nome vazio;
* idade inválida;
* idade negativa;
* sintomas vazios;
* identificadores inexistentes.

As validações com Expressões Regulares ainda serão implementadas.

Para atender ao RA01 será incluído posteriormente um campo adequado à aplicação, como CPF, telefone ou e-mail, com validação através de Regex.

A implementação deverá ser simples e ter finalidade didática.

---

# RA02 — Utility Types do TypeScript

### Status: Verificar / complementar

O projeto deverá demonstrar explicitamente pelo menos um Utility Type do TypeScript, como:

```typescript
Partial
Pick
Omit
Readonly
Record
```

Uma possibilidade adequada ao sistema é utilizar:

```typescript
Record<Prioridade, number>
```

para definir o peso utilizado na ordenação das prioridades.

Exemplo conceitual:

```typescript
const pesosPrioridade: Record<Prioridade, number> = {
    VERMELHO: 5,
    LARANJA: 4,
    AMARELO: 3,
    VERDE: 2,
    AZUL: 1
};
```
 o `Record` garante que todas as prioridades definidas pelo sistema tenham um valor correspondente.


---





# Persistência dos dados

O projeto não utiliza banco de dados.

Os pacientes são armazenados em:

```text
src/dados/pacientes.json
```

Foi escolhida persistência em JSON, e não tecnologias de banco de dados.

O acesso ao arquivo é centralizado no módulo:

```text
pacienteRepositorio.ts
```


---

# Ciclo de atendimento

O fluxo principal da aplicação é:

```text
Cadastrar paciente
        ↓
Criar atendimento
        ↓
AGUARDANDO
        ↓
Alterar prioridade
(opcional)
        ↓
EM_ATENDIMENTO
        ↓
FINALIZADO
        ↓
Histórico
```

Quando um atendimento é finalizado ele não é removido nem movido para outro arquivo.

Seu status simplesmente passa para:

```text
FINALIZADO
```

e a propriedade:

```typescript
dataFinalizacao
```

é preenchida.

O histórico de atendimentos é obtido através dos próprios atendimentos existentes no paciente.

---

# Histórico de prioridade

O histórico de prioridade possui uma finalidade diferente do histórico de atendimentos.

Quando a prioridade de um atendimento muda, por exemplo:

```text
VERDE → AMARELO
```

é registrado:

* prioridade anterior;
* nova prioridade;
* data da alteração;
* motivo.

Se o mesmo paciente voltar à UPA posteriormente, um novo atendimento será criado.

Portanto:

```text
historicoPrioridade
```

representa mudanças de prioridade dentro de um atendimento.

Já:

```text
paciente.atendimentos
```

representa todas as passagens daquele paciente pela UPA.

---

# Como executar

Primeiro instale as dependências:

```bash
npm install
```

Compile o projeto:

```bash
npm run build
```

Execute:

```bash
npm start
```

ou:

```bash
npm run dev
```

para compilar e iniciar a aplicação em sequência.

---

# Utilização

Ao executar o sistema é exibido:

```text
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
```

O usuário escolhe uma opção e informa os dados solicitados pelo terminal.

O programa permanece em execução até que a opção `0` seja selecionada.

---

