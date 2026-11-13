import { mkdir, writeFile, open, unlink, readFile } from 'node:fs/promises';
import { Gmail } from './gmail.mjs';
import { windowFor, normalize, digest, selectJobMessages } from './digest.mjs';

async function main() {
  if (process.argv.length > 2) throw new Error('Este programa somente gera arquivo local; não aceita opções de envio.');
  const account = process.env.GMAIL_ACCOUNT;
  let refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) {
    try { refreshToken = JSON.parse(await readFile('tokens/google.json', 'utf8')).refresh_token; }
    catch (error) { if (error.code !== 'ENOENT') throw new Error('Não foi possível ler o token local. Refaça a autorização.'); }
  }
  const config = { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, refreshToken };
  if (!account || Object.values(config).some(v => !v)) throw new Error('Configure GMAIL_ACCOUNT, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN. Consulte SETUP.md.');
  await mkdir('data', { recursive: true });
  const lock = await open('data/run.lock', 'wx').catch(() => { throw new Error('Outra execução ou lock pendente em data/run.lock. Verifique antes de reexecutar.'); });
  try {
    const gmail = new Gmail(config);
    await gmail.authorize();
    const profile = await gmail.api('profile');
    if (profile.emailAddress.toLowerCase() !== account.toLowerCase()) throw new Error('A conta autorizada difere de GMAIL_ACCOUNT.');
    const window = windowFor();
    const messages = selectJobMessages((await gmail.collect(window)).map(normalize)).sort((a, b) => b.receivedAt - a.receivedAt);
    const body = digest(messages, window);
    await mkdir('output', { recursive: true });
    await writeFile(`output/${window.key}.txt`, body, { mode: 0o600 });
    console.log(`Resumo local salvo em output/${window.key}.txt: ${messages.length} mensagem(ns). Nenhum e-mail enviado.`);
  } finally { await lock.close(); await unlink('data/run.lock'); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
