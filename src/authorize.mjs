import { createServer } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) throw new Error('Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env. Consulte SETUP.md.');
const state = randomBytes(32).toString('base64url');
const verifier = randomBytes(48).toString('base64url');
let processing = false;
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname !== '/callback' || url.searchParams.get('state') !== state || processing) { res.writeHead(400).end('Solicitação inválida'); return; }
  processing = true;
  try {
    const code = url.searchParams.get('code');
    if (!code) throw new Error('Autorização não concedida.');
    const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', signal: AbortSignal.timeout(30000), body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirect, grant_type: 'authorization_code', code_verifier: verifier }) });
    if (!response.ok) throw new Error('Não foi possível trocar o código de autorização.');
    const token = await response.json();
    if (!token.refresh_token) throw new Error('Google não retornou refresh token. Refaça o consentimento.');
    await mkdir('tokens', { recursive: true });
    await writeFile('tokens/google.json', JSON.stringify({ refresh_token: token.refresh_token }, null, 2), { mode: 0o600 });
    res.end('Autorização concluída. Pode fechar esta aba.');
    console.log('Token salvo em tokens/google.json (ignorado pelo Git). Não compartilhe seu conteúdo.');
  } catch (error) { res.writeHead(400).end('Autorização não concluída. Consulte o terminal.'); console.error(error.message); process.exitCode = 1; }
  finally { clearTimeout(timer); server.close(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const redirect = `http://127.0.0.1:${server.address().port}/callback`;
const timer = setTimeout(() => { console.error('Tempo para autorização esgotado.'); server.close(); process.exitCode = 1; }, 300000);
const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirect, response_type: 'code', scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send', access_type: 'offline', prompt: 'consent', state, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' });
if (process.env.GMAIL_ACCOUNT) params.set('login_hint', process.env.GMAIL_ACCOUNT);
console.log(`Abra no navegador para autorizar:\nhttps://accounts.google.com/o/oauth2/v2/auth?${params}`);
