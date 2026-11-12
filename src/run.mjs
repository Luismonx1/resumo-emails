import { mkdir, writeFile, open, unlink } from 'node:fs/promises';
import { Gmail } from './gmail.mjs';
import { windowFor, normalize, digest, mime, messageId } from './digest.mjs';

async function main() {
  const account = process.env.GMAIL_ACCOUNT;
  const config = { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, refreshToken: process.env.GOOGLE_REFRESH_TOKEN };
  if (!account || Object.values(config).some(v => !v)) throw new Error('Configure GMAIL_ACCOUNT, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN. Consulte SETUP.md.');
  const args = process.argv.slice(2);
  if (args.some(v => v !== '--send')) throw new Error('Argumentos aceitos: --send');
  const send = args.includes('--send');
  await mkdir('data', { recursive: true });
  const lock = await open('data/run.lock', 'wx').catch(() => { throw new Error('Outra execução ou lock pendente em data/run.lock. Verifique antes de reexecutar.'); });
  try {
    const gmail = new Gmail(config);
    await gmail.authorize();
    const profile = await gmail.api('profile');
    if (profile.emailAddress.toLowerCase() !== account.toLowerCase()) throw new Error('A conta autorizada difere de GMAIL_ACCOUNT.');
    const window = windowFor();
    const previous = await gmail.list(`in:sent rfc822msgid:${messageId(account, window.key)}`);
    if (previous.length) { console.log('Resumo deste período já enviado.'); return; }
    const messages = (await gmail.collect(window)).map(normalize).sort((a, b) => b.receivedAt - a.receivedAt);
    const body = digest(messages, window);
    await mkdir('output', { recursive: true });
    await writeFile(`output/${window.key}.txt`, body, { mode: 0o600 });
    if (!send) { console.log('Prévia salva em output/. Nenhum e-mail enviado.'); return; }
    // Do not retry POST: a timeout can mean that Gmail accepted the message.
    try { await gmail.api('messages/send', { raw: mime(account, window.key, body) }); }
    catch { throw new Error('Envio falhou ou ficou incerto. Confira Enviados antes de tentar novamente; não houve repetição automática.'); }
    console.log(`Resumo enviado: ${messages.length} mensagem(ns) processada(s).`);
  } finally { await lock.close(); await unlink('data/run.lock'); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
