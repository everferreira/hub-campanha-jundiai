// ═══════════════════════════════════════════════════════════
// UTILS.JS — Utilitários: Timezone, Ordenação, Helpers
// ═══════════════════════════════════════════════════════════

const TZ = 'America/Sao_Paulo';

function getHojeSP() {
  const agora = new Date();
  const sp = new Date(agora.toLocaleString('en-US', { timeZone: TZ }));
  return sp;
}

function getDataSP() {
  const sp = getHojeSP();
  return `${String(sp.getDate()).padStart(2,'0')}/${String(sp.getMonth()+1).padStart(2,'0')}`;
}

function getHoraSP() {
  const agora = new Date();
  return agora.toLocaleString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
}

function parseDataPrazo(prazo) {
  if (!prazo || prazo === 'Contínuo' || prazo.includes('-') || prazo.includes(',')) return null;
  const partes = prazo.split('/');
  if (partes.length !== 2) return null;
  const d = parseInt(partes[0], 10), m = parseInt(partes[1], 10);
  if (!d || !m) return null;
  const ano = getHojeSP().getFullYear();
  return new Date(ano, m - 1, d, 23, 59, 59);
}

function prazoToNum(prazo) {
  const dt = parseDataPrazo(prazo);
  return dt ? dt.getTime() : 99999999999999;
}

function calcUrgencia(prazo) {
  const dt = parseDataPrazo(prazo);
  if (!dt) return 'normal';
  const hoje = getHojeSP();
  const hojeMN = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  const diff = Math.ceil((dt - hojeMN) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'duetoday';
  if (diff === 1) return 'tomorrow';
  if (diff <= 3) return 'soon';
  return 'normal';
}

function ordenarTarefas(lista) {
  const ordem = { overdue: 0, duetoday: 1, tomorrow: 2, urgent: 3, soon: 4, normal: 5, continuous: 6 };
  return [...lista].sort((a, b) => {
    const urgA = a._sortUrg !== undefined ? a._sortUrg : (ordem[a.urg || calcUrgencia(a.prazo)] !== undefined ? ordem[a.urg || calcUrgencia(a.prazo)] : 99);
    const urgB = b._sortUrg !== undefined ? b._sortUrg : (ordem[b.urg || calcUrgencia(b.prazo)] !== undefined ? ordem[b.urg || calcUrgencia(b.prazo)] : 99);
    if (urgA !== urgB) return urgA - urgB;
    const dA = a._prazoNum || prazoToNum(a.prazo) || 99999999999999;
    const dB = b._prazoNum || prazoToNum(b.prazo) || 99999999999999;
    if (dA !== dB) return dA - dB;
    return (a.titulo || a.texto || '').localeCompare(b.titulo || b.texto || '');
  });
}

function salvarEstado(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch(e) {}
}

function carregarEstado(chave, padrao) {
  try {
    const val = localStorage.getItem(chave);
    return val ? JSON.parse(val) : padrao;
  } catch(e) { return padrao; }
}

function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function formatarDataSP(data) {
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: TZ });
}

function mostrarToast(mensagem, tipo = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

function diffDias(data) {
  const hoje = getHojeSP();
  const diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
  return diff;
}

// Estado do "ver mais" persistido por usuário
function getExpandirTarefas() {
  return carregarEstado('expandir_' + (usuarioAtual ? usuarioAtual.id : ''), false);
}
function setExpandirTarefas(val) {
  salvarEstado('expandir_' + (usuarioAtual ? usuarioAtual.id : ''), val);
}

// Clima da Campanha (padrão: normal)
function getClima() {
  return carregarEstado('hub_clima', 'normal');
}
function setClima(val) {
  salvarEstado('hub_clima', val);
  document.body.className = document.body.className.replace(/clima-\w+/g, '').trim();
  if (val !== 'normal') document.body.classList.add('clima-' + val);
}

function aplicarClima() {
  const clima = getClima();
  document.body.classList.remove('clima-critico', 'clima-alerta', 'clima-normal', 'clima-festa');
  if (clima !== 'normal') document.body.classList.add('clima-' + clima);
}