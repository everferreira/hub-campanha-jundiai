// ═══════════════════════════════════════════════════════════
// APP.JS — Orquestrador Principal
// ═══════════════════════════════════════════════════════════

async function renderDashboard(session) {
  if (!session) return;
  usuarioAtual = session;

  // Carrega dados
  await carregarDados();
  const db = getDb();
  if (!db) {
    document.getElementById('dashboard-content').innerHTML = '<div class="panel-error"><span>⚠️</span><p>Erro ao carregar dados da campanha.</p><button class="btn primary small" onclick="location.reload()">Tentar novamente</button></div>';
    return;
  }

  if (!db.tarefas) db.tarefas = [];
  if (!db.publicacoes) db.publicacoes = [];
  if (!db.engajamento) db.engajamento = [];

  // Aplica clima
  aplicarClima();

  // Relógio
  relogioSP('relogio-sp');

  // Saudação
  const saudacao = document.getElementById('user-greeting');
  if (saudacao) saudacao.textContent = session.nome;

  // Offline badge
  const offlineBadge = renderBadgeOffline();

  // Tabs
  const tabs = [];
  tabs.push({ id: 'acoes', label: '📋 Ações', nivel: 1 });
  if (podeVer(5)) tabs.push({ id: 'estrategia', label: '📊 Estratégia', nivel: 5 });
  tabs.push({ id: 'conteudo', label: '📝 Conteúdo', nivel: 1 });
  tabs.push({ id: 'agenda', label: '📅 Agenda', nivel: 1 });
  tabs.push({ id: 'referencias', label: '🖼️ Ref.', nivel: 1 });
  renderTabs(tabs);

  // Conteúdo principal
  const main = document.getElementById('dashboard-content');
  main.innerHTML = `
    <div class="tab-section active" id="tab-acoes">
      <div class="greeting" id="greeting-area">
        <h2>${getSaudacao()}, ${session.nome}! 💛</h2>
        <p>${session.funcao} na campanha Erika Hilton em Jundiaí<br>${offlineBadge}</p>
        <div id="sync-badge" class="sync-badge" style="display:none;margin-top:4px;"></div>
      </div>
      <div class="countdown-bar" id="countdown-bar"></div>
      <div class="stats-grid" id="stats-grid"></div>
      <div class="section-title">⭐ Minhas Tarefas <span class="count" id="my-tasks-count">0</span></div>
      <div id="my-tasks"></div>
      ${podeVer(5) ? `
        <div class="section-title">📋 Todas as Tarefas <span class="count" id="all-tasks-count">0</span></div>
        <div id="all-tasks-filter" class="filter-chips"></div>
        <div id="all-tasks-content"></div>
      ` : ''}
      <div class="section-collapse">
        <div class="section-title" style="cursor:pointer;" onclick="toggleSecao(this)">📢 Publicações & Engajamento <span class="collapse-arrow">▶</span></div>
        <div class="collapse-body" id="body-pub-eng">
          <div id="publicacao-grid"></div>
          <div class="section-title" style="font-size:0.9em;">🔄 Engajamento Diário</div>
          <div id="engajamento-grid"></div>
        </div>
      </div>
      <div class="section-title">📤 Sincronização</div>
      <div id="historico-conclusoes"></div>
      <button id="btn-sync" class="btn secondary" onclick="sincronizarConclusoes()" style="width:100%;">📤 Sincronizar conclusões</button>
      <div id="news-section-acoes"></div>
    </div>
    ${podeVer(5) ? `
    <div class="tab-section" id="tab-estrategia">
      <div id="eleitoral-section"><div class="section-title">📊 Painel Eleitoral</div><div class="eleitoral-grid" id="eleitoral-grid"></div></div>
      <div id="financeiro-section"><div class="section-title">💵 Painel Financeiro</div><div class="finance-grid" id="financeiro-grid"></div></div>
      <div id="emendas-section"><div class="section-title">💰 Emendas</div><div class="eleitoral-grid" id="emendas-grid"></div></div>
      <div class="bio-card" id="bio-card"></div>
      <div id="partners-area-estrategia"></div>
    </div>
    ` : ''}
    <div class="tab-section" id="tab-conteudo">
      <div class="section-title">📝 Conteúdo Pronto</div>
      <div id="conteudo-container"></div>
    </div>
    <div class="tab-section" id="tab-agenda">
      <div class="section-title">📅 Agenda 18/08</div>
      <div style="overflow-x:auto;"><table class="agenda-table" id="agenda-table"></table></div>
      <div class="section-title">🚩 Bandeiraço 16/08</div>
      <div class="update-badge">🔄 atualizado em 07/08</div>
      <div id="mobilizacao-grid" class="mobilizacao-grid"></div>
      <div class="section-title" style="font-size:0.9em;">✅ Checklist</div>
      <div class="checklist" id="checklist-bandeiraco"></div>
    </div>
    <div class="tab-section" id="tab-referencias">
      <div class="section-title">👥 Equipe</div>
      <div id="quem-somos-container"></div>
      <div class="section-title">🔗 Links</div>
      <div class="links-grid" id="links-grid"></div>
    </div>
  `;

  // Renderiza cada seção com safeRender
  safeRender(() => renderCountdown(db), 'Contagem regressiva', null);
  safeRender(() => renderMinhasTarefas(db, session), 'Minhas Tarefas', null);
  if (podeVer(5)) {
    safeRender(() => renderTodasTarefas(db), 'Todas Tarefas', null);
    safeRender(() => renderEleitoral(db), 'Painel Eleitoral', null);
    safeRender(() => renderEmendas(db), 'Emendas', null);
    safeRender(() => renderFinanceiro(db), 'Financeiro', null);
    safeRender(() => renderPartners(db), 'Parceiros', null);
  }
  safeRender(() => renderPublicacoes(db), 'Publicações', null);
  safeRender(() => renderEngajamento(db), 'Engajamento', null);
  safeRender(() => renderBandeiraco(db), 'Bandeiraço', null);
  safeRender(() => renderAgendaVisita(db), 'Agenda', null);
  safeRender(() => renderLinks(db), 'Links', null);
  safeRender(() => renderQuemSomos(db), 'Equipe', null);
  safeRender(() => renderNoticias(db), 'Notícias', null);
  safeRender(() => renderConteudoPronto(db), 'Conteúdo', null);
  safeRender(() => renderMobilizacao(db), 'Mobilização', null);

  // Sincronização
  carregarConclusoesOnline();
  renderHistoricoConclusoes();
  atualizarBadgeSync();

  // Switch to first tab
  switchTab('acoes');
}

function getSaudacao() {
  const h = getHojeSP().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

function renderTabs(tabs) {
  const nav = document.getElementById('main-nav');
  const bnav = document.getElementById('bottom-nav');
  if (nav) nav.innerHTML = tabs.map(t => `<button class="tab-btn" id="tabbtn-${t.id}" onclick="switchTab('${t.id}')">${t.label}</button>`).join('');
  if (bnav) bnav.innerHTML = tabs.map(t => `<button class="bnav-btn" id="bnavbtn-${t.id}" onclick="switchTab('${t.id}')"><span class="icon">${t.label.split(' ')[0]}</span><span>${t.label.split(' ').slice(1).join(' ')}</span></button>`).join('');
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  const section = document.getElementById('tab-' + tabId);
  if (section) section.classList.add('active');
  const btn = document.getElementById('tabbtn-' + tabId);
  if (btn) btn.classList.add('active');
  const bbtn = document.getElementById('bnavbtn-' + tabId);
  if (bbtn) bbtn.classList.add('active');
}

function toggleModoFoco() {
  document.body.classList.toggle('modo-foco');
  const btn = document.getElementById('btn-foco');
  if (btn) btn.textContent = document.body.classList.contains('modo-foco') ? '🎯 ON' : '🎯';
  mostrarToast(document.body.classList.contains('modo-foco') ? '🎯 Modo Foco ativado' : '🎯 Modo Foco desativado', 'info');
}

function toggleSecao(el) {
  const body = el.parentElement.querySelector('.collapse-body');
  const arrow = el.querySelector('.collapse-arrow');
  if (body) body.classList.toggle('closed');
  if (arrow) arrow.classList.toggle('open');
}

/* ─── RENDER: Countdown ─── */
function renderCountdown(db) {
  const el = document.getElementById('countdown-bar');
  if (!el) return;
  el.innerHTML = (db.campanha.datas_importantes || []).map(d => contagemRegressiva(d.data, d.evento, d.icone)).join('');
  el.innerHTML += `<div class="countdown-item"><div class="days" style="color:var(--warning);">${getDataSP()}</div><div class="label">📅 Hoje</div></div>`;
}

/* ─── RENDER: Minhas Tarefas ─── */
function renderMinhasTarefas(db, session) {
  const todas = [...(db.tarefas || []), ...(db.publicacoes || []).map(p => ({ ...p, texto: p.tema, prazo: p.data, responsaveis: p.responsavel || ['Equipe'], _isPublicacao: true })), ...(db.engajamento || []).map(e => ({ ...e, texto: e.tarefa, prazo: 'Contínuo', _isEngajamento: true }))];
  const minhas = todas.filter(t => t.responsaveis && t.responsaveis.some(r => {
    if (typeof r === 'string') return r.toLowerCase().includes(session.id) || r.toLowerCase().includes(session.nome.split(' ')[0].toLowerCase());
    return false;
  }));
  const ordenadas = ordenarTarefas(minhas);
  document.getElementById('my-tasks-count').textContent = ordenadas.length;
  renderTasksComToggle(ordenadas, 'my-tasks');
}

/* ─── RENDER: Todas as Tarefas ─── */
function renderTodasTarefas(db) {
  const todas = ordenarTarefas([...(db.tarefas || []), ...(db.publicacoes || []).map(p => ({ ...p, texto: p.tema, prazo: p.data, responsaveis: p.responsavel || ['Equipe'], _isPublicacao: true })), ...(db.engajamento || []).map(e => ({ ...e, texto: e.tarefa, prazo: 'Contínuo', _isEngajamento: true }))]);
  document.getElementById('all-tasks-count').textContent = todas.length;
  renderTasksComToggle(todas, 'all-tasks-content');
  renderAllTasksFilter(db, todas);
}

function renderAllTasksFilter(db, todas) {
  const el = document.getElementById('all-tasks-filter');
  if (!el) return;
  const respSet = new Set();
  [...(db.tarefas || []).flatMap(t => t.responsaveis || []), ...(db.publicacoes || []).flatMap(p => p.responsavel || []), ...(db.engajamento || []).map(e => e.responsavel || '')].forEach(r => { if (r) respSet.add(r.split(' ')[0]); });
  const todos = [...respSet].sort();
  el.innerHTML = `<button class="filter-chip active" onclick="aplicarFiltroTarefas('todos', this)">👥 Todos</button>` + todos.map(r => `<button class="filter-chip" onclick="aplicarFiltroTarefas('${r}', this)">${r}</button>`).join('');
}

function aplicarFiltroTarefas(resp, btn) {
  document.querySelectorAll('#all-tasks-filter .filter-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const db = getDb();
  if (!db) return;
  const todas = ordenarTarefas([...(db.tarefas || []), ...(db.publicacoes || []).map(p => ({ ...p, texto: p.tema, prazo: p.data, responsaveis: p.responsavel || ['Equipe'], _isPublicacao: true })), ...(db.engajamento || []).map(e => ({ ...e, texto: e.tarefa, prazo: 'Contínuo', _isEngajamento: true }))]);
  const filtradas = resp === 'todos' ? todas : todas.filter(t => (t.responsaveis || []).some(r => (r || '').split(' ')[0] === resp));
  renderTasksComToggle(filtradas, 'all-tasks-content');
}

/* ─── RENDER: Eleitoral ─── */
function renderEleitoral(db) {
  const el = document.getElementById('eleitoral-grid');
  if (!el) return;
  const votos = 1944, meta = 10000, necessario = meta - votos;
  el.innerHTML = `
    <div class="eleitoral-card thermometer">
      <div style="font-size:0.75em;color:var(--text-secondary);">Termômetro</div>
      <div style="font-size:0.9em;font-weight:700;margin:4px 0;">${votos.toLocaleString()} → ${meta.toLocaleString()}</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(votos/meta*100)}%"></div></div>
      <div class="desc">${Math.round(votos/meta*100)}% da meta<br>Faltam ${necessario.toLocaleString()} votos</div>
    </div>
    <div class="eleitoral-card"><div class="big-num">${votos.toLocaleString()}</div><div class="desc">Votos (2022)</div><div class="sub">Erika Hilton</div></div>
    <div class="eleitoral-card"><div class="big-num gold">${meta.toLocaleString()}</div><div class="desc">Meta 2026</div><div class="sub">↗ ${Math.round(meta/votos*100-100)}% crescimento</div></div>
    <div class="eleitoral-card"><div class="big-num">327.491</div><div class="desc">Eleitores</div><div class="sub">3 zonas: 065, 281, 424</div></div>
    <div class="eleitoral-card"><div class="big-num green">R$ 4,6M</div><div class="desc">Emendas</div><div class="sub">Biênio 2025-2026</div></div>
    <div class="eleitoral-card"><div class="big-num" style="color:var(--warning);">6.375</div><div class="desc">Teto Boulos 2022</div><div class="sub">🔥 SUPERAR! +57% acima do teto</div></div>
  `;
}

/* ─── RENDER: Emendas ─── */
function renderEmendas(db) {
  const el = document.getElementById('emendas-grid');
  if (!el) return;
  const emendas = [
    { valor: 'R$ 680 mil', destino: 'Oftalmologia infantil', articulacao: 'Cardume' },
    { valor: 'R$ 320 mil', destino: 'Centro TEA (Autismo)', articulacao: 'Cardume' },
    { valor: 'R$ 1 milhão', destino: 'CTA — HIV, sífilis, hepatites', articulacao: 'Tiana Cauton' },
  ];
  el.innerHTML = emendas.map(e => `
    <div class="eleitoral-card"><div class="big-num gold">${e.valor}</div><div class="desc">${e.destino}</div><div class="sub">🤝 ${e.articulacao}</div></div>
  `).join('');
}

/* ─── RENDER: Financeiro ─── */
function renderFinanceiro(db) {
  const el = document.getElementById('financeiro-grid');
  if (!el) return;
  const gastos = db.financas ? db.financas.gastos || [] : [];
  const total = gastos.reduce((s, g) => s + (g.valor || 0), 0);
  el.innerHTML = `
    <div class="finance-card entrada"><div class="valor">R$ 0</div><div class="label">Arrecadado</div></div>
    <div class="finance-card"><div class="valor">R$ ${(15000).toLocaleString()}</div><div class="label">Previsto</div></div>
    <div class="finance-card saida"><div class="valor">R$ ${total.toLocaleString()}</div><div class="label">Gastos</div></div>
    <div class="finance-card saida"><div class="valor">R$ ${(-total).toLocaleString()}</div><div class="label">Saldo</div></div>
    <div style="grid-column:1/-1;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;font-size:0.76em;color:var(--text-secondary);">
      <strong style="color:var(--text);">📋 Gastos previstos:</strong><br>${gastos.map(g => `• ${g.item}: <strong>R$ ${(g.valor || 0).toLocaleString()}</strong>`).join('<br>')}
    </div>
  `;
}

/* ─── RENDER: Partners ─── */
function renderPartners(db) {
  const el = document.getElementById('partners-area-estrategia');
  if (!el || !podeVer(3)) return;
  const parceiros = db.parceiros || [];
  el.innerHTML = '<div class="section-title">🤝 Parceiros</div>' + parceiros.map(p => `
    <div class="task-card" style="cursor:default;border-left-color:var(--accent);">
      <div class="task-text"><strong>${p.nome}</strong></div>
      <div class="task-meta">${p.descricao}${p.contato ? ' • 📞 ' + p.contato : ''}</div>
    </div>
  `).join('');
}

/* ─── RENDER: Publicações ─── */
function renderPublicacoes(db) {
  const el = document.getElementById('publicacao-grid');
  if (!el) return;
  const pubs = db.publicacoes || [];
  const formatos = [...new Set(pubs.map(p => p.formato))];
  el.innerHTML = `
    <div class="filter-chips" id="pub-filters">
      <button class="filter-chip active" onclick="filtrarPublicacoes('todos','todos', this)">📋 Todas</button>
      ${formatos.map(f => `<button class="filter-chip" onclick="filtrarPublicacoes('${f}','todos', this)">${f}</button>`).join('')}
    </div>
    <div id="pub-grid" class="tasks-grid">${pubs.map(p => cardTarefa({ ...p, texto: p.tema, prazo: p.data, responsaveis: p.responsavel || ['Equipe'], _isPublicacao: true })).join('')}</div>
  `;
}

function filtrarPublicacoes(formato, fase, btn) {
  document.querySelectorAll('#pub-filters .filter-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const db = getDb();
  if (!db) return;
  const pubs = (db.publicacoes || []).filter(p => (formato === 'todos' || p.formato === formato) && (fase === 'todos' || p.fase === fase));
  const grid = document.getElementById('pub-grid');
  if (grid) grid.innerHTML = pubs.map(p => cardTarefa({ ...p, texto: p.tema, prazo: p.data, responsaveis: p.responsavel || ['Equipe'], _isPublicacao: true })).join('');
}

/* ─── RENDER: Engajamento ─── */
function renderEngajamento(db) {
  const el = document.getElementById('engajamento-grid');
  if (!el) return;
  const eng = db.engajamento || [];
  el.innerHTML = '<div class="tasks-grid">' + eng.map(e => `<div class="task-card" onclick="toggleEng(this, '${e.tarefa.replace(/'/g, "\\'")}')"><div class="task-text">${e.tarefa}</div><div class="task-meta">👤 ${e.responsavel}</div></div>`).join('') + '</div>';
}

function toggleEng(el, tarefa) {
  el.classList.toggle('done');
  const done = el.classList.contains('done');
  localStorage.setItem('eng_' + tarefa, done);
  if (done && usuarioAtual) registrarConclusao(tarefa, usuarioAtual.nome);
}

/* ─── RENDER: Bandeiraço ─── */
function renderBandeiraco(db) {
  const el = document.getElementById('checklist-bandeiraco');
  if (!el) return;
  const itens = db.checklist_bandeiraco || [
    { tarefa: 'Definir local', prazo: '05/08', responsavel: 'Ever Maria', urgente: true },
    { tarefa: 'Definir horário', prazo: '05/08', responsavel: 'Ever Maria', urgente: true },
    { tarefa: 'Material de campanha', prazo: '10/08', responsavel: 'Junior Arcanjo' },
    { tarefa: 'Equipe de apoio', prazo: '10/08', responsavel: 'Tiana Cauton' },
    { tarefa: 'Evento Instagram/WhatsApp', prazo: '08/08', responsavel: 'Kawa' },
    { tarefa: 'Convocação apoiadores', prazo: '10/08', responsavel: 'Junior Arcanjo' },
    { tarefa: 'Caixa de som + microfone', prazo: '15/08', responsavel: 'Hoanny' },
    { tarefa: 'Cobertura stories', prazo: '16/08', responsavel: 'Eva, Kawa' },
    { tarefa: 'Pós-evento: fotos', prazo: '17/08', responsavel: 'Kawa' },
  ];
  el.innerHTML = checklist(itens, 'band');
}

/* ─── RENDER: Mobilização ─── */
function renderMobilizacao(db) {
  const el = document.getElementById('mobilizacao-grid');
  if (!el) return;
  const mob = db.mobilizacao || {};
  const items = [
    { atual: mob.confirmados ? mob.confirmados.atual : 42, meta: 100, label: 'Confirmações' },
    { atual: mob.liderancas ? mob.liderancas.atual : 8, meta: 25, label: 'Lideranças' },
    { atual: mob.bairros ? mob.bairros.atual : 5, meta: 15, label: 'Bairros' },
    { atual: mob.voluntarios ? mob.voluntarios.atual : 12, meta: 30, label: 'Voluntários' },
  ];
  el.innerHTML = items.map(i => termometro(i.atual, i.meta, i.label)).join('');
}

/* ─── RENDER: Agenda Visita ─── */
function renderAgendaVisita(db) {
  const el = document.getElementById('agenda-table');
  if (!el) return;
  const agenda = db.agenda_visita || [];
  el.innerHTML = '<tr><th>Horário</th><th>Atividade</th><th>Local</th></tr>' + agenda.map(a => `<tr class="${a.destaque ? 'highlight' : ''}"><td>${a.hora}</td><td>${a.atividade}</td><td>${a.local}</td></tr>`).join('');
}

/* ─── RENDER: Links ─── */
function renderLinks(db) {
  const el = document.getElementById('links-grid');
  if (!el) return;
  const links = db.links || {};
  const items = Object.entries(links).map(([k, v]) => {
    const icons = { drive_atas: '📁', drive_fotos: '🖼️', notion: '📘', planilha: '📊', insta_oficial: '📸', insta_local: '📍', site_oficial: '🌐', camara: '🏛️', wikipedia: '📖' };
    const names = { drive_atas: 'Drive Atas', drive_fotos: 'Drive Fotos', notion: 'Notion', planilha: 'Planilha', insta_oficial: 'Instagram Erika', insta_local: 'Instagram Jundiaí', site_oficial: 'Site Oficial', camara: 'Câmara', wikipedia: 'Wikipedia' };
    return { icon: icons[k] || '🔗', name: names[k] || k, url: v };
  });
  el.innerHTML = items.map(i => `<a href="${i.url}" target="_blank" class="link-item"><span class="icon">${i.icon}</span><span class="info"><span class="name">${i.name}</span></span></a>`).join('');
}

/* ─── RENDER: Quem Somos ─── */
function renderQuemSomos(db) {
  const el = document.getElementById('quem-somos-container');
  if (!el) return;
  el.innerHTML = '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px;"><div style="font-size:0.9em;font-weight:700;margin-bottom:8px;">👥 Comitê Erika Hilton 2026</div><div style="font-size:0.8em;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;">Comitê municipal da campanha de Erika Hilton para deputada federal em Jundiaí (2026). Coordenação de Ever Maria Tobias Ferreira.</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;">' + EQUIPE.map(p => `<div class="qs-card"><div class="n">${p.nome}</div><div class="r">${p.funcao}</div></div>`).join('') + '</div></div>';
}

/* ─── RENDER: Notícias ─── */
function renderNoticias(db) {
  const el = document.getElementById('news-section-acoes');
  if (!el) return;
  const noticias = db.noticias || [];
  el.innerHTML = '<div class="section-title">📰 Notícias</div>' + noticias.map(n => `
    <div class="task-card" style="cursor:default;"><div class="task-header"><div class="task-text"><strong>${n.titulo}</strong></div></div><div class="task-meta">${n.fonte} • <a href="${n.url}" target="_blank">🔗 Ler</a></div></div>
  `).join('');
}

/* ─── RENDER: Conteúdo Pronto ─── */
function renderConteudoPronto(db) {
  const el = document.getElementById('conteudo-container');
  if (!el) return;
  el.innerHTML = `
    <p class="text-muted" style="font-size:0.78em;margin-bottom:12px;">Legendas, hashtags e roteiros — clique pra copiar</p>
    <div class="section-title" style="font-size:0.9em;">📄 Legendas</div>
    <div id="legendas-lista" class="tasks-grid"></div>
    <div class="section-title" style="font-size:0.9em;">🏷️ Hashtags</div>
    <div id="hashtags-lista" class="filter-chips"></div>
    <div class="section-title" style="font-size:0.9em;">🎬 Scripts Reels</div>
    <div id="scripts-lista" class="tasks-grid"></div>
  `;
  const legendas = db.conteudo_pronto && db.conteudo_pronto.legendas ? db.conteudo_pronto.legendas : {};
  const keys = Object.keys(legendas);
  if (keys.length > 0) {
    document.getElementById('legendas-lista').innerHTML = keys.map(k => `<div class="content-card" onclick="mostrarLegenda('${k}')"><strong>${k}</strong></div>`).join('');
  }
}

function mostrarLegenda(key) {
  const db = getDb();
  if (!db || !db.conteudo_pronto || !db.conteudo_pronto.legendas || !db.conteudo_pronto.legendas[key]) return;
  const texto = db.conteudo_pronto.legendas[key];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = () => overlay.remove();
  overlay.innerHTML = `<div class="modal-box" onclick="event.stopPropagation()"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><strong style="color:var(--accent);">📄 Legenda</strong><button class="btn secondary small" onclick="this.closest('.modal-overlay').remove()">✕</button></div><div id="legenda-texto" style="background:#0b0f19;border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;font-size:0.82em;color:var(--text);line-height:1.6;white-space:pre-wrap;">${texto}</div><button class="copy-btn" onclick="copiarTexto(this, '${key.replace(/'/g, "\\'")}')">📋 Copiar</button></div>`;
  document.body.appendChild(overlay);
}

function copiarTexto(btn, key) {
  const db = getDb();
  if (!db || !db.conteudo_pronto || !db.conteudo_pronto.legendas || !db.conteudo_pronto.legendas[key]) return;
  const texto = db.conteudo_pronto.legendas[key];
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(() => {
      btn.textContent = '✅ Copiado!'; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = '📋 Copiar'; btn.classList.remove('copied'); }, 2000);
    });
  }
}

/* ─── Modo Foco ─── */

/* ─── Init ─── */
// Called by auth.js after login