// ═══════════════════════════════════════════════════════════
// DB.JS — Gerenciamento de Dados: fetch, cache, fallback
// ═══════════════════════════════════════════════════════════

let dbDados = null;
let dbCarregado = false;
let dbOffline = false;

async function carregarDados() {
  // 1. Tenta cache local
  const cache = carregarEstado('hub_db_cache', null);
  if (cache) {
    dbDados = cache;
    dbCarregado = true;
  }

  // 2. Fetch do db.json (mesmo origin, sem CORS)
  try {
    const url = 'data/db.json?t=' + Date.now();
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const dados = await resp.json();
    dbDados = dados;
    dbCarregado = true;
    dbOffline = false;
    salvarEstado('hub_db_cache', dados);
    return dados;
  } catch (err) {
    console.warn('⚠️ db.json fetch falhou, usando cache/fallback:', err.message);
    dbOffline = true;
    if (!dbDados && typeof window.FALLBACK_DATA !== 'undefined') {
      dbDados = window.FALLBACK_DATA;
      dbCarregado = true;
    }
    return dbDados;
  }
}

function getDb() {
  return dbDados;
}

function isOffline() {
  return dbOffline;
}

function isDbReady() {
  return dbCarregado;
}