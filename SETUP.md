# Configuração do Gmail

Por padrão, este guia configura acesso **somente de leitura**. A opção de lixeira abaixo exige consentimento adicional e não é usada pelo resumo automático.

## Opcional: permitir mover alertas processados para a lixeira

1. No mesmo projeto do Google Cloud, abra **Google Auth Platform → Acesso a dados → Adicionar ou remover escopos** e adicione `https://www.googleapis.com/auth/gmail.modify`. Esse escopo também cobre leitura; não é necessário adicionar `gmail.send` nem `https://mail.google.com/`.
2. Execute `npm run authorize -- --allow-trash` nesta pasta e conclua o consentimento no navegador enquanto o terminal permanece aberto.
3. A autorização só substitui `tokens/google.json` após receber o escopo solicitado. Se usar `GOOGLE_REFRESH_TOKEN` no ambiente, ele tem prioridade: remova esse override localmente para usar o arquivo renovado, sem divulgar seu conteúdo.

O Google concede a `gmail.modify` poderes amplos, inclusive envio; a restrição a leitura/lixeira é do código, não da credencial. A classe Gmail só permite a operação de lixeira quando instanciada com `allowTrash: true`; não há envio nem exclusão permanente implementados. O resumo e o coletor Radar continuam sem habilitar a lixeira. A rotina automática de selecionar alertas totalmente processados ainda precisa ser integrada. Não usar apenas o estado lido como critério; preservar entrevistas, retornos e mensagens com vagas pendentes. Esta configuração não apaga nenhum e-mail por si só.

## 1. Criar o projeto no Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie ou selecione um projeto.
3. Abra **APIs e serviços → Biblioteca**.
4. Pesquise por **Gmail API** e clique em **Ativar**.

## 2. Configurar a autorização

Na área **Google Auth Platform**:

1. Em **Branding**, defina o nome e os e-mails de contato.
2. Em **Público-alvo**, escolha **Externo** e adicione sua conta como usuário de teste.
3. Em **Acesso a dados**, mantenha somente:

   ```text
   https://www.googleapis.com/auth/gmail.readonly
   ```

4. Em **Clientes**, crie um cliente OAuth 2.0 do tipo **Aplicativo para computador**.

Se `gmail.send` ou outra permissão aparecer, remova-a antes de continuar.

## 3. Configurar o ambiente local

Copie o modelo:

```powershell
Copy-Item .env.example .env
```

Preencha:

```dotenv
GMAIL_ACCOUNT=seu-email@gmail.com
GOOGLE_CLIENT_ID=seu-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=sua-chave
GOOGLE_REFRESH_TOKEN=
```

Deixe `GOOGLE_REFRESH_TOKEN` vazio para que o programa use o token salvo localmente após a autorização.

## 4. Autorizar a conta

```powershell
npm run authorize
```

Abra imediatamente o endereço exibido no terminal e mantenha o processo aberto. O link expira após cinco minutos. Ao final, o navegador mostrará **Autorização concluída** e o token será salvo em `tokens/google.json`.

Confira na tela do Google que o aplicativo solicita apenas permissão para visualizar mensagens e configurações do Gmail.

## 5. Gerar o resumo

```powershell
npm run digest
```

O arquivo será criado em:

```text
output/AAAA-MM-DD.txt
```

Nenhuma mensagem será enviada ou modificada.

## Solução de problemas

### `node` não é reconhecido

Instale o Node.js 22 ou superior e reabra o terminal. Verifique com:

```powershell
node --version
```

### O navegador não acessa `127.0.0.1`

O processo de autorização expirou ou foi encerrado. Execute `npm run authorize` novamente, mantenha o terminal aberto e use o novo link.

### Autorização Google falhou

Confirme se:

- a Gmail API está ativada no mesmo projeto do cliente OAuth;
- a conta está cadastrada como usuário de teste;
- o ID e a chave do cliente no `.env` pertencem ao cliente do tipo computador;
- o escopo `gmail.readonly` está configurado.

### A autorização expira depois de sete dias

Isso é esperado quando um aplicativo externo permanece no status **Testando**. Gere uma nova autorização. A publicação em produção deve ser avaliada separadamente antes de uso contínuo.

## Revogar o acesso

O acesso pode ser removido a qualquer momento em [Conexões com apps e serviços de terceiros](https://myaccount.google.com/connections).

Após revogar, o token local deixa de funcionar. Você também pode remover `tokens/google.json` do computador.
