
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
  const text = folded(clean(message.subject) + ' ' + clean(message.text));
  // Generic words such as "oportunidade" or "entrevista" alone are not job evidence.
  const jobContext = /\b(estagios?|estagiari[oa]s?|internships?|empregos?|recrutamento|recrutador[aes]*|candidat(?:ura|o|a)s?|processos? seletivos?|hiring|jobs?|job applications?|job interviews?|careers?)\b/.test(text)
    || /\b(vagas?|oportunidades?)\s+(?:abertas?\s+)?(?:de |para |em |na area de )?(?:estagio|emprego|trabalho|desenvolv\w*|programa\w*|dados|analista|engenh\w*|ti\b|tecnologia|suporte|assistente|auxiliar|vendedor|gerente|profission\w*)\b/.test(text)
    || /\b(vagas?|oportunidades?)\b.{0,100}\b(curriculo|candidate-se|candidatar|contratacao|salario|clt|remuneracao)\b/.test(text);
  if (!jobContext) return null;
  if (/\b(entrevistas?|testes? tecnicos?|processos? seletivos?|candidaturas?|interviews?|assessments?|job applications?)\b/.test(text)) return 'Retornos, entrevistas e processos seletivos';
  if (/\b(estagios?|estagiari[oa]s?|internships?)\b/.test(text)) return 'Estágios — precisam de avaliação';
  return 'Outras vagas';
}

export function selectJobMessages(messages) {
  return messages.filter(message => classify(message) !== null);
}

export function digest(messages, window) {
  const groups = ['Estágios — precisam de avaliação', 'Retornos, entrevistas e processos seletivos', 'Outras vagas'];
  messages = selectJobMessages(messages);
  const date = value => value.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const lines = [`Resumo diário — ${window.key}`, `Período: ${date(window.start)} até ${date(window.end)} (Brasília)`, `${messages.length} mensagem(ns) relacionada(s) a vagas.`, '', 'Resumo por extração de trechos, sem IA. A classificação é preliminar; consulte o e-mail original para requisitos e prazos. Nenhuma vaga foi aprovada pelo Busca Vagas.', ''];
  if (!messages.length) lines.push('Nenhum e-mail relacionado a vagas identificado neste período.', '');
  for (const group of groups) {
    const items = messages.filter(m => classify(m) === group);
    lines.push(`${group} (${items.length})`);
    for (const m of items) lines.push(`• ${m.subject}`, `  De: ${m.from}`, `  Trecho: ${m.text.slice(0, 650)}${m.text.length > 650 ? '…' : ''}`, `  Original: ${m.link}`, '');
    lines.push('');
  }
  return lines.join('\n');
}

