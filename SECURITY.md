# Segurança

## Dados tratados

O projeto acessa o Gmail com o escopo `gmail.readonly` e processa localmente assunto, remetente, data, texto simples e link da mensagem. Anexos não são processados.

## Segredos locais

Nunca publique:

- `.env`;
- `tokens/google.json`;
- credenciais OAuth;
- arquivos de `output/`;
- conteúdo real de e-mails em issues, commits ou logs.

Esses caminhos são ignorados pelo Git, mas podem ser sincronizados por serviços de armazenamento instalados no computador.

## Princípio de acesso mínimo

A implementação aceita somente operações de leitura da Gmail API. Solicitações de escrita são bloqueadas no cliente antes da chamada de rede.

## Revogação

Revogue o acesso na [Conta Google](https://myaccount.google.com/connections) se uma credencial for exposta, se o computador for perdido ou se o projeto deixar de ser usado. Depois, substitua as credenciais OAuth e remova os tokens locais.

## Relato de vulnerabilidades

Como o repositório é privado, registre vulnerabilidades diretamente com o proprietário do repositório e não inclua credenciais ou conteúdo de e-mails no relato.
