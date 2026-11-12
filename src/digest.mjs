import { createHash } from 'node:crypto';

export function windowFor(now = new Date()) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  // São Paulo currently uses UTC-03:00. Keep this explicit and review if local law changes.
  let end = new Date(`${day}T09:00:00-03:00`);
  if (end > now) end = new Date(end.getTime() - 86400000);
  return { start: new Date(end.getTime() - 86400000), end, key: end.toISOString().slice(0, 10) };
}

const clean = value => String(value ?? '').replace(/[\r\n\t\x00-\x1f]+/g, ' ').replace(/\s+/g, ' ').trim();
const folded = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export function normalize(message) {
  const headers = message.payload?.headers ?? [];
  const header = name => clean(headers.find(h => h.name.toLowerCase() === name)?.value);
  const textParts = [];
  function visit(part) {
    if (part.filename || part.body?.attachmentId) return;
    if (part.mimeType === 'text/plain' && part.body?.data) textParts.push(Buffer.from(part.body.data, 'base64url').toString('utf8'));
    for (const child of part.parts ?? []) visit(child);
  }
  visit(message.payload ?? {});
  const text = clean(textParts.join(' ') || message.snippet);
  return { id: message.id, receivedAt: Number(message.internalDate), subject: header('subject') || '(sem assunto)', from: header('from'), text, link: `https://mail.google.com/mail/u/0/#all/${message.id}` };
}

export function classify(message) {
  const text = folded(`${message.subject} ${message.text}`);
  if (/\b(entrevista|teste tecnico|processo seletivo|candidatura|interview|assessment)\b/.test(text)) return 'Retornos, entrevistas e processos seletivos';
  if (/\b(estagio|estagiari[oa]s?|internship|intern)\b/.test(text)) return 'Estágios — precisam de avaliação';
  if (/\b(vagas?|oportunidades?|recrutamento|hiring|jobs?)\b/.test(text)) return 'Outras oportunidades';
  return 'Demais e-mails';
}

export function digest(messages, window) {
  const groups = ['Estágios — precisam de avaliação', 'Retornos, entrevistas e processos seletivos', 'Outras oportunidades', 'Demais e-mails'];
  const date = value => value.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const lines = [`Resumo diário — ${window.key}`, `Período: ${date(window.start)} até ${date(window.end)} (Brasília)`, `${messages.length} mensagem(ns).`, '', 'Resumo por extração de trechos, sem IA. A classificação é preliminar; consulte o e-mail original para requisitos e prazos. Nenhuma vaga foi aprovada pelo Busca Vagas.', ''];
  for (const group of groups) {
    const items = messages.filter(m => classify(m) === group);
    lines.push(`${group} (${items.length})`);
    for (const m of items) lines.push(`• ${m.subject}`, `  De: ${m.from}`, `  Trecho: ${m.text.slice(0, 650)}${m.text.length > 650 ? '…' : ''}`, `  Original: ${m.link}`, '');
    lines.push('');
  }
  return lines.join('\n');
}

export function messageId(account, key) {
  const hash = createHash('sha256').update(account.toLowerCase()).digest('hex').slice(0, 20);
  return `resumo-emails.${hash}.${key}@resumo-emails.local`;
}

export function mime(account, key, body) {
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+$/.test(account)) throw new Error('GMAIL_ACCOUNT inválida');
  const subject = Buffer.from(`Resumo diário de e-mails — ${key}`).toString('base64');
  const encoded = Buffer.from(body).toString('base64').match(/.{1,76}/g)?.join('\r\n') ?? '';
  return Buffer.from([`From: ${account}`, `To: ${account}`, `Subject: =?UTF-8?B?${subject}?=`, `Message-ID: <${messageId(account, key)}>`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', encoded].join('\r\n')).toString('base64url');
}
