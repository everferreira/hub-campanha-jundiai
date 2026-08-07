// ═══════════════════════════════════════════════════════════
// SYNC.JS — Sincronização via GitHub API
// ═══════════════════════════════════════════════════════════

const COMPLETIONS_URL = 'https://raw.githubusercontent.com/refundarjundiai/hub-campanha-jundiai/master/completions.json';
const COMPLETIONS_API = 'https://api.github.com/repos/refundarjundiai/hub-campanha-jundiai/contents/completions.json';

let ultimoSync = null;

function carregarConclusoesOnline() {
  fetch(COMPLETIONS_URL + '?t=' + Date.now())
    .then(r => r.ok ? r.json() : Promise.resolve([]))
    .then(dados => {
      if (Array.isArray(dados)) {
        localStorage.setItem('completions_online', JSON.stringify(dados));
        atualizarBadgeSync();
      }
    })
    .catch(() => {});
}

function getConclusoesLocais() {
  try { return JSON.parse(localStorage.getItem('completions_online') || '[]'); } catch { return []; }
}

function getConclusoesPendentes() {
  try { return JSON.parse(localStorage.getItem('completions_pendentes') || '[]'); } catch { return []; }
}

function registrarConclusao(tarefa, responsavel) {
  const entry = {
    tarefa,
    responsavel,
    concluidaEm: new Date().toLocaleString('pt-BR', { timeZone: TZ }),
    timestamp: Date.now()
  };
  const pendentes = getConclusoesPendentes();
  pendentes.push(entry);
  localStorage.setItem('completions_pendentes', JSON.stringify(pendentes));
  atualizarBadgeSync();
  mostrarToast('✅ Concluído: ' + tarefa);
}

function atualizarBadgeSync() {
  const pendentes = getConclusoesPendentes().length;
  const el = document.getElementById('sync-badge');
  if (el) {
    el.innerHTML = pendentes > 0 ? '📤 ' + pendentes + ' pendente(s)' : '✅ Sincronizado';
    el.style.display = 'block';
  }
}

function sincronizarConclusoes() {
  const pendentes = getConclusoesPendentes();
  if (pendentes.length === 0) { mostrarToast('Nada a sincronizar', 'info'); return; }
  if (typeof GITHUB_TOKEN === 'undefined') {
    mostrarToast('⚠️ Token não configurado. Execute setup-token.sh', 'error');
    return;
  }
  const btn = document.getElementById('btn-sync');
  if (btn) { btn.textContent = '⏳'; btn.disabled = true; }

  fetch(COMPLETIONS_API, {
    headers: { 'Authorization': 'token ' + GITHUB_TOKEN, 'Accept': 'application/vnd.github.v3+json' }
  })
  .then(r => r.json())
  .then(meta => {
    const sha = meta.sha;
    const online = getConclusoesLocais();
    const todas = [...pendentes, ...online];
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(todas, null, 2))));
    return fetch(COMPLETIONS_API, {
      method: 'PUT',
      headers: { 'Authorization': 'token ' + GITHUB_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Sync ' + new Date().toLocaleString('pt-BR', { timeZone: TZ }), content, sha })
    });
  })
  .then(r => r.json())
  .then(res => {
    if (res.content) {
      localStorage.setItem('completions_pendentes', '[]');
      carregarConclusoesOnline();
      mostrarToast('✅ Sincronizado!');
      if (btn) { btn.textContent = '📤 Sincronizar'; btn.disabled = false; }
    } else {
      throw new Error(res.message || 'Erro');
    }
  })
  .catch(err => {
    mostrarToast('⚠️ Erro: ' + err.message, 'error');
    if (btn) { btn.textContent = '📤 Sincronizar'; btn.disabled = false; }
  });
}

function renderHistoricoConclusoes() {
  const el = document.getElementById('historico-conclusoes');
  if (!el) return;
  const todas = getConclusoesLocais();
  if (todas.length === 0) {
    el.innerHTML = '<div class="text-muted" style="padding:8px;font-size:0.82em;">Nenhuma conclusão registrada.</div>';
    return;
  }
  const recentes = [...todas].reverse().slice(0, 10);
  el.innerHTML = '<div class="text-muted" style="font-size:0.72em;margin-bottom:6px;">📋 Últimas (' + todas.length + '):</div>' +
    recentes.map(c => '<div class="historico-item"><span><strong>' + c.responsavel + '</strong>: ' + c.tarefa + '</span><span class="time">' + c.concluidaEm + '</span></div>').join('') +
    (todas.length > 10 ? '<div class="text-muted" style="font-size:0.7em;margin-top:4px;">...e mais ' + (todas.length - 10) + '</div>' : '');
}