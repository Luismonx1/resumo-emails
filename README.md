# Resumo Emails

Leitura do Gmail e resumo em arquivo local, com destaque preliminar para estágios e oportunidades.

## Funcionamento

- Solicita somente gmail.readonly. Não envia, responde, exclui ou altera e-mails.
- Classifica por palavras-chave e mostra trechos, sem API de IA.
- Salva output/AAAA-MM-DD.txt no computador; reexecutar substitui o resumo do mesmo período.
- Consulta 24 horas encerradas às últimas 9h de Brasília. Não recupera automaticamente dias perdidos.
- GitHub Actions executa apenas testes, sem credenciais ou agendamento de resumos.
- A integração com Busca Vagas ainda não foi implementada; nenhuma vaga é aprovada automaticamente.

## Uso

Requer Node.js 22 ou superior. Consulte [SETUP.md](SETUP.md).

    node --env-file=.env src/authorize.mjs
    node --env-file=.env src/run.mjs
    node --test

O token é lido de tokens/google.json quando GOOGLE_REFRESH_TOKEN está vazio. A conta autorizada deve coincidir com GMAIL_ACCOUNT.

Credenciais, tokens e resumos ficam fora do Git. A pasta está no OneDrive: ignorar no Git não impede a sincronização desses arquivos pelo OneDrive.

## Integração futura

Extrair vagas com links e evidências, deduplicar e submeter aos critérios vigentes do Busca Vagas. O resumo não substitui a avaliação e a revisão de informações incertas.

## Seleção de mensagens

O resumo inclui somente mensagens identificadas como vagas, estágios ou retornos de processos seletivos. Publicidade genérica e demais assuntos ficam fora do arquivo. A seleção é heurística e pode ter falsos positivos ou omissões; não aplica ainda os filtros de aprovação do Busca Vagas. O programa lê as mensagens do período para classificá-las, mas só grava as selecionadas.
