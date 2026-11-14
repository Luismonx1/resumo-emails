# Resumo Emails

![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)
![Gmail API](https://img.shields.io/badge/Gmail_API-read--only-EA4335?logo=gmail&logoColor=white)
![Tests](https://img.shields.io/github/actions/workflow/status/Luismonx1/resumo-emails/tests.yml?label=tests)
![Visibility](https://img.shields.io/badge/visibility-private-lightgrey)

Utilitário local que lê mensagens do Gmail em modo somente leitura e cria um resumo diário focado em vagas, estágios e processos seletivos.

O projeto reduz o ruído da caixa de entrada sem responder, excluir, marcar ou enviar mensagens. O resultado fica apenas no computador do usuário, em um arquivo de texto fácil de consultar.

## Recursos

- autenticação segura com OAuth 2.0 e escopo `gmail.readonly`;
- seleção de e-mails relacionados a vagas e processos seletivos;
- categorias separadas para estágios, retornos de candidaturas e outras vagas;
- janela diária de 24 horas encerrada às 9h no horário de Brasília;
- links diretos para as mensagens originais no Gmail;
- geração local, sem API de inteligência artificial;
- testes automatizados no GitHub Actions;
- proteção contra operações de escrita na camada de acesso ao Gmail.

## Como funciona

```text
Gmail (somente leitura)
        │
        ▼
Normalização das mensagens
        │
        ▼
Classificação por contexto de vagas
        │
        ▼
Resumo local em output/AAAA-MM-DD.txt
```

A classificação atual é baseada em regras e palavras-chave. Ela pode produzir falsos positivos ou deixar passar mensagens incomuns. O resumo serve para triagem; ele não aprova oportunidades nem substitui a leitura da mensagem original.

## Requisitos

- Node.js 22 ou superior;
- uma conta Gmail;
- um projeto no Google Cloud com a Gmail API ativada;
- um cliente OAuth 2.0 do tipo **Aplicativo para computador**.

## Configuração

As instruções completas para criar e autorizar o cliente OAuth estão em [SETUP.md](SETUP.md).

1. Crie o arquivo local de configuração:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Preencha o `.env` com a conta e as credenciais OAuth do Google Cloud.

3. Autorize o acesso somente de leitura:

   ```powershell
   npm run authorize
   ```

4. Gere o resumo:

   ```powershell
   npm run digest
   ```

5. Execute os testes:

   ```powershell
   npm test
   ```

## Exemplo de saída

```text
Resumo diário — 2026-11-14
Período: 13/11/2026, 09:00:00 até 14/11/2026, 09:00:00 (Brasília)
2 mensagens relacionadas a vagas.

Estágios — precisam de avaliação (1)
• Estágio em dados
  De: Recrutamento <recrutamento@empresa.com>
  Trecho: Estamos com uma oportunidade...
  Original: https://mail.google.com/...
```

## Privacidade e segurança

- O aplicativo solicita apenas `https://www.googleapis.com/auth/gmail.readonly`.
- A camada de acesso bloqueia requisições de envio ou alteração antes de chamar a API.
- `.env`, tokens OAuth, logs e resumos gerados são ignorados pelo Git.
- O conteúdo dos e-mails não é enviado a serviços de IA.
- Anexos não são abertos nem processados.
- O repositório pode estar em uma pasta sincronizada pelo OneDrive; o `.gitignore` não impede essa sincronização externa.

## Estrutura

```text
.
├── .github/workflows/   # testes automatizados
├── src/
│   ├── authorize.mjs    # autorização OAuth local
│   ├── digest.mjs       # normalização, seleção e formatação
│   ├── gmail.mjs        # cliente Gmail somente leitura
│   └── run.mjs          # execução do pipeline
├── test/                # testes automatizados
├── .env.example         # modelo de configuração
├── SETUP.md             # configuração detalhada
└── package.json
```

## Limitações atuais

- A execução diária ainda precisa ser iniciada localmente.
- O status de teste do Google pode exigir nova autorização após sete dias.
- A classificação não usa modelos de IA nem interpreta todos os formatos possíveis de anúncio.
- O projeto ainda não aplica localização, perfil técnico, bolsa ou outros critérios do Busca Vagas.

## Roadmap

- [ ] automatizar a execução local diária às 9h;
- [ ] melhorar a extração estruturada de empresa, cargo, local, bolsa e link;
- [ ] adicionar deduplicação de oportunidades;
- [ ] integrar com os critérios e o acompanhamento do Busca Vagas;
- [ ] criar um fluxo de revisão para informações ausentes ou incertas.

## Status do projeto

Em desenvolvimento ativo. A versão atual já autentica no Gmail, lê mensagens em modo somente leitura e gera resumos locais de e-mails relacionados a vagas.
