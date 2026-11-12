export class Gmail {
  constructor(config, request = fetch) { this.config = config; this.request = request; }
  async authorize() {
    const c = this.config;
    const response = await this.request('https://oauth2.googleapis.com/token', { method: 'POST', signal: AbortSignal.timeout(30000), body: new URLSearchParams({ client_id: c.clientId, client_secret: c.clientSecret, refresh_token: c.refreshToken, grant_type: 'refresh_token' }) });
    if (!response.ok) throw new Error(`Autorização Google falhou (HTTP ${response.status}). Verifique ou renove o consentimento.`);
    this.token = (await response.json()).access_token;
    if (!this.token) throw new Error('Resposta de autorização sem token');
  }
  async api(path, body) {
    const response = await this.request(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
      method: body ? 'POST' : 'GET', signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.ok) throw new Error(`Gmail falhou (HTTP ${response.status}); execução interrompida, sem resumo parcial.`);
    return response.json();
  }
  async list(query) {
    const ids = new Set();
    let page;
    do {
      const params = new URLSearchParams({ q: query, maxResults: '500' });
      if (page) params.set('pageToken', page);
      const result = await this.api(`messages?${params}`);
      for (const message of result.messages ?? []) ids.add(message.id);
      page = result.nextPageToken;
    } while (page);
    return [...ids];
  }
  async collect(window) {
    const start = Math.floor(window.start.getTime() / 1000) - 1;
    const end = Math.ceil(window.end.getTime() / 1000);
    const ids = await this.list(`after:${start} before:${end} -in:sent -in:drafts`);
    const messages = [];
    for (const id of ids) {
      const m = await this.api(`messages/${encodeURIComponent(id)}?format=full`);
      const at = Number(m.internalDate);
      const generated = (m.payload?.headers ?? []).some(h => h.name.toLowerCase() === 'message-id' && /@resumo-emails\.local>/.test(h.value));
      if (!generated && at >= window.start.getTime() && at < window.end.getTime()) messages.push(m);
    }
    return messages;
  }
}
