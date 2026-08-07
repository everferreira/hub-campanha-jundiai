// ═══════════════════════════════════════════════════════════
// AUTH.JS — Login, Sessão, Níveis
// ═══════════════════════════════════════════════════════════

const SENHA_PADRAO = 'erika2026';

const EQUIPE = [
  { id: 'ever', nome: 'Ever Maria', funcao: 'Coordenadora Municipal', nivel: 5, cor: '#e11d48', iniciais: 'EM' },
  { id: 'tiana', nome: 'Tiana Cauton', funcao: 'Assessora', nivel: 5, cor: '#8b5cf6', iniciais: 'TC' },
  { id: 'junior', nome: 'Junior Arcanjo', funcao: 'Mobilizador de Rua', nivel: 3, cor: '#f59e0b', iniciais: 'JA' },
  { id: 'hoanny', nome: 'Hoanny', funcao: 'Eventos', nivel: 3, cor: '#3b82f6', iniciais: 'HO' },
  { id: 'joao', nome: 'João', funcao: 'Financeiro', nivel: 3, cor: '#10b981', iniciais: 'JO' },
  { id: 'kwa', nome: 'Kwa', funcao: 'Redes Sociais — Vídeos', nivel: 2, cor: '#06b6d4', iniciais: 'KW' },
  { id: 'eva', nome: 'Eva', funcao: 'Redes Sociais — Artes', nivel: 2, cor: '#ec4899', iniciais: 'EV' },
];

let usuarioAtual = null;
let usuarioPendente = null;

document.addEventListener('DOMContentLoaded', () => {
  // Verifica sessão ativa
  const session = localStorage.getItem('hub_session');
  if (session) {
    usuarioAtual = JSON.parse(session);
    initApp();
  } else {
    renderLogin();
  }
});

function renderLogin() {
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('senha-area').style.display = 'none';
  document.getElementById('mudar-senha-area').style.display = 'none';

  const grid = document.getElementById('people-grid');
  grid.style.display = 'grid';
  grid.innerHTML = EQUIPE.map(p => `
    <div class="person-btn" onclick="selecionarPessoa('${p.id}')">
      <div class="avatar" style="background:${p.cor}">${p.iniciais}</div>
      <div class="pname">${p.nome}</div>
      <div class="prole">${p.funcao}</div>
    </div>
  `).join('');
}

function selecionarPessoa(id) {
  usuarioPendente = EQUIPE.find(p => p.id === id);
  if (!usuarioPendente) return;
  document.getElementById('people-grid').style.display = 'none';
  document.getElementById('senha-label').textContent = `🔐 Senha — ${usuarioPendente.nome}`;
  document.getElementById('senha-input').value = '';
  document.getElementById('senha-erro').style.display = 'none';
  document.getElementById('senha-area').style.display = 'block';
  document.getElementById('senha-input').focus();
}

function verificarSenha() {
  const senha = document.getElementById('senha-input').value.trim();
  if (!senha) { mostrarErro('Digite uma senha'); return; }
  const senhaSalva = localStorage.getItem('senha_' + usuarioPendente.id) || SENHA_PADRAO;
  if (senha === senhaSalva) {
    entrar(usuarioPendente);
  } else {
    mostrarErro('❌ Senha incorreta');
    document.getElementById('senha-input').value = '';
    document.getElementById('senha-input').focus();
  }
}

function mostrarErro(msg) {
  const el = document.getElementById('senha-erro');
  el.textContent = msg; el.style.display = 'block';
}

function cancelarSenha() {
  usuarioPendente = null;
  document.getElementById('senha-area').style.display = 'none';
  document.getElementById('mudar-senha-area').style.display = 'none';
  document.getElementById('people-grid').style.display = 'grid';
}

function mostrarMudarSenha() {
  document.getElementById('senha-area').style.display = 'none';
  document.getElementById('mudar-senha-area').style.display = 'block';
  document.getElementById('senha-antiga').value = '';
  document.getElementById('senha-nova').value = '';
  document.getElementById('senha-confirmar').value = '';
  document.getElementById('mudar-senha-erro').style.display = 'none';
}

function cancelarMudarSenha() {
  document.getElementById('mudar-senha-area').style.display = 'none';
  document.getElementById('senha-area').style.display = 'block';
  document.getElementById('senha-input').focus();
}

function salvarNovaSenha() {
  const antiga = document.getElementById('senha-antiga').value.trim();
  const nova = document.getElementById('senha-nova').value.trim();
  const conf = document.getElementById('senha-confirmar').value.trim();
  const errEl = document.getElementById('mudar-senha-erro');
  if (!antiga || !nova || !conf) { errEl.textContent = 'Preencha todos os campos'; errEl.style.display = 'block'; return; }
  const senhaAtual = localStorage.getItem('senha_' + usuarioPendente.id) || SENHA_PADRAO;
  if (antiga !== senhaAtual) { errEl.textContent = 'Senha atual incorreta'; errEl.style.display = 'block'; return; }
  if (nova !== conf) { errEl.textContent = 'Nova senha e confirmação não conferem'; errEl.style.display = 'block'; return; }
  if (nova.length < 4) { errEl.textContent = 'Mínimo 4 caracteres'; errEl.style.display = 'block'; return; }
  localStorage.setItem('senha_' + usuarioPendente.id, nova);
  errEl.style.color = '#10b981'; errEl.textContent = '✅ Senha alterada!'; errEl.style.display = 'block';
  setTimeout(() => { cancelarMudarSenha(); errEl.style.color = '#ef4444'; }, 1500);
}

function entrar(pessoa) {
  usuarioAtual = pessoa;
  const session = { id: pessoa.id, nome: pessoa.nome, funcao: pessoa.funcao, nivel: pessoa.nivel, cor: pessoa.cor, iniciais: pessoa.iniciais };
  localStorage.setItem('hub_session', JSON.stringify(session));
  initApp();
}

function initApp() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  // Renderiza o dashboard (chamado pelo app.js)
  if (typeof renderDashboard === 'function') {
    renderDashboard(usuarioAtual);
  }
}

function logout() {
  localStorage.removeItem('hub_session');
  location.reload();
}

function getPessoa(id) {
  return EQUIPE.find(p => p.id === id);
}

function podeVer(nivelMinimo) {
  return usuarioAtual && usuarioAtual.nivel >= nivelMinimo;
}

function nivelMinimo(tipo) {
  const req = { geral: 5, eleitoral: 5, financas: 3, emendas: 3, parceiros: 3 };
  return usuarioAtual && usuarioAtual.nivel >= (req[tipo] || 0);
}