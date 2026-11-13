# Autorização somente de leitura

1. Mantenha a Gmail API ativada e o cliente OAuth do tipo Computador.
2. Adicione seu Gmail aos usuários de teste em Público-alvo.
3. Em Acesso a dados, mantenha somente https://www.googleapis.com/auth/gmail.readonly e remova gmail.send. Salve.
4. Se já concluiu uma autorização com envio, remova o acesso anterior de Resumo Emails nas conexões de terceiros da Conta Google antes de autorizar novamente. Mudar código ou escopos não revoga permissões anteriores.
5. Copie .env.example para .env somente se o arquivo ainda não existir. Preencha conta, ID e chave do cliente. Deixe GOOGLE_REFRESH_TOKEN vazio para usar o novo token local.
6. Execute node --env-file=.env src/authorize.mjs e abra o link no navegador do mesmo computador. Autorize apenas leitura. O processo aguarda cinco minutos; se expirar, execute novamente e use o link novo.
7. Execute node --env-file=.env src/run.mjs. O resumo fica em output/AAAA-MM-DD.txt, sem envio por e-mail.

Não compartilhe .env nem tokens/google.json. Em modo de teste do Google, o token de renovação para Gmail expira após sete dias. Ainda não há rotina automática local configurada.
