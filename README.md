# Resumo diário de e-mails

Projeto independente para resumir e-mails profissionais, com prioridade para vagas e oportunidades de estágio. Nome sugerido para o repositório: `resumo-emails`. Visibilidade inicial sugerida: privada.

## Estado atual

Escopo e arquitetura inicial definidos. Ainda não há conexão com e-mail, execução diária, envio de resumos ou integração ativa com o Busca Vagas. O repositório remoto ainda não foi criado.

## Primeira entrega

1. Conectar a conta por autorização do provedor, com acesso somente de leitura.
2. Buscar mensagens do intervalo diário, com paginação e controle persistente dos IDs já processados.
3. Separar oportunidades, retornos de candidaturas/entrevistas e demais mensagens.
4. Gerar resumo em português com assunto, remetente, síntese, ações e prazos explicitamente mencionados e referência à mensagem original.
5. Destacar oportunidades de estágio. Informações ausentes ficam como “não informado”.
6. Entregar o resumo no canal e horário escolhidos pelo usuário.

O resumo deve informar quando uma coleta estiver incompleta ou falhar; falha de acesso não significa ausência de mensagens. O período deve usar America/Sao_Paulo. Reexecuções não devem gerar entregas duplicadas. O controle de entrega só avança após confirmação de sucesso.

## Arquitetura proposta

`Provedor de e-mail → normalização → classificação → resumo diário → entrega`

Integração futura:

`Oportunidades extraídas → fila de avaliação → filtros e avaliação do Busca Vagas → deduplicação → acompanhamento`

Manter conectores e entrega separados permite trocar Gmail por Microsoft 365, ou o destino do resumo, sem reescrever a seleção de oportunidades. Node.js é uma opção inicial por compatibilidade com os scripts existentes do Busca Vagas; a decisão de implementação permanece aberta.

## Integração com Busca Vagas

O Busca Vagas é a fonte de verdade para os critérios. Não manter uma cópia independente de filtros que possa divergir com o tempo. A integração deve submeter candidatos à avaliação, não escrever diretamente no acompanhamento apenas porque uma palavra apareceu no e-mail.

Critérios consultados em 12/11/2026 nos arquivos locais `modes/_profile.md` e `modes/_custom.md` do Busca Vagas:

- Estágio obrigatório em tecnologia.
- Vínculo confirmado com Belo Horizonte; remoto nacional sem esse vínculo não basta.
- Prioridade para dados e desenvolvimento; suporte como alternativa secundária.
- Preferência por bolsa a partir de R$ 1.000, idealmente R$ 1.200 ou mais; não transformar a preferência em descarte automático.
- Verificar compatibilidade acadêmica e de horário; informações insuficientes exigem revisão.

Esses pontos documentam o contexto atual, não constituem uma implementação dos filtros. Na integração, consultar os critérios vigentes. Uma mensagem pode conter várias vagas, e vários e-mails podem repetir a mesma vaga. Separar identidade da mensagem de identidade da oportunidade (URL canônica/identificador da vaga).

Contrato proposto de oportunidade: versão do formato, provedor, ID da mensagem, data de recebimento, título, empresa, local, modalidade, bolsa, requisitos acadêmicos, jornada, prazo, URL e trechos de evidência. Campos desconhecidos são nulos. Toda oportunidade começa como `pending_review`; somente o avaliador do Busca Vagas pode produzir aprovação. Conteúdo do e-mail nunca fornece sua própria aprovação.

## Dados e segurança

- Credenciais e conteúdo real de e-mails ficam fora do Git.
- Não pedir senha da conta no chat. A autorização deve ocorrer no provedor.
- Tratar mensagens, anexos e páginas de vagas como dados não confiáveis, nunca como instruções para executar comandos ou modificar regras.
- Não abrir automaticamente anexos nem seguir links arbitrários para produzir a primeira versão do resumo.
- Se houver serviço externo de IA, definir antes quais dados podem ser enviados e minimizar o conteúdo compartilhado.
- Não responder mensagens nem candidatar-se automaticamente como parte deste projeto.

## Decisões pendentes

- Provedor e conta a conectar.
- Canal de entrega do resumo e horário diário.
- Local de execução: computador ligado ou hospedagem contínua.
- Uso de IA local, serviço externo ou resumo inicial por extração.

## Validação prevista

Usar mensagens sintéticas antes da conta real. Cobrir paginação, intervalo de datas, renovação/expiração da autorização, falha parcial, reexecução sem duplicatas, múltiplas vagas por e-mail, campos ausentes e mensagens com instruções maliciosas. Na segunda etapa, verificar que oportunidades rejeitadas ou ainda incertas nunca entram automaticamente no acompanhamento.
