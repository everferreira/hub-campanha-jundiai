// ═══════════════════════════════════════════════════════════
// COMPONENTS.JS — Componentes Reutilizáveis
// ═══════════════════════════════════════════════════════════

function cardTarefa(t) {
  const urg = calcUrgencia(t.prazo);
  const isOverdue = urg === 'overdue';
  const isDuetoday = urg === 'duetoday';
  const prazoClass = isOverdue ? 'overdue' : isDuetoday ? 'duetoday' : t.urg || 'normal';
  const rotuloPrazo = t.prazo === 'Contínuo' ? '🔄 Contínuo' : isOverdue ? `🚨 ${t.prazo}` : `📅 ${t.prazo}`;

  let catClass = 'badge-tarefa', catLabel = '📋 Tarefa';
  if (t._isProd) {
    const resp = (t.responsaveis && t.responsaveis[0] || '').toLowerCase();
    if (resp.startsWith('eva') || resp.startsWith('Eva')) { catClass = 'badge-arte'; catLabel = '🎨 Arte'; }
    else if (resp.startsWith('kwa') || resp.startsWith('Kwa')) { catClass = 'badge-video'; catLabel = '🎬 Vídeo'; }
    else { catClass = 'badge-tarefa'; catLabel = '📦 Produção'; }
  } else if (t._isPublicacao) { catClass = 'badge-publicar'; catLabel = '📱 Publicar'; }
  else if (t._isEngajamento) { catClass = 'badge-engajar'; catLabel = '💬 Engajar'; }

  const urgBadge = (isOverdue || t.urg === 'urgent') ? `<span class="badge-hoh pending">🔴 URGENTE</span>` : '';
  const hohBadge = t.hoh_status === 'pending' ? `<span class="badge-hoh pending">⏳ HOH</span>` : t.hoh_status === 'approved' ? `<span class="badge-hoh approved">✅ HOH</span>` : '';

  const done = localStorage.getItem('done_' + (t.id || t.texto)) === 'true';

  return `
    <div class="task-card ${done ? 'done' : ''} ${isOverdue ? 'overdue' : ''} ${t.urg === 'urgent' ? 'urgent' : ''}"
         onclick="toggleTask(this, '${(t.id || t.texto).replace(/'/g, "\\'")}')">
      <div class="task-header">
        <div class="task-text"><strong>${t.titulo || t.texto}</strong> ${urgBadge} ${hohBadge}</div>
        <span class="task-prazo ${prazoClass}">${rotuloPrazo}</span>
      </div>
      <div class="task-meta">
        <span class="badge ${catClass}">${catLabel}</span>
        ${t.responsaveis ? `<span>👥 ${t.responsaveis.join(', ')}</span>` : ''}
      </div>
    </div>
  `;
}

function toggleTask(el, key) {
  el.classList.toggle('done');
  const done = el.classList.contains('done');
  localStorage.setItem('done_' + key, done);
  if (done && usuarioAtual) {
    registrarConclusao(key, usuarioAtual.nome);
  }
}

function renderTasksComToggle(tasks, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const expandir = getExpandirTarefas();
  const urgentes = tasks.filter(t => calcUrgencia(t.prazo) === 'overdue' || calcUrgencia(t.prazo) === 'duetoday' || t.urg === 'urgent');
  const outras = tasks.filter(t => !(calcUrgencia(t.prazo) === 'overdue' || calcUrgencia(t.prazo) === 'duetoday' || t.urg === 'urgent'));
  if (tasks.length === 0) { el.innerHTML = '<p class="text-muted" style="padding:12px;">Nenhuma tarefa pendente. ✅</p>'; return; }
  const mostrar = expandir ? tasks : urgentes;
  const ocultas = outras.length;
  let html = '<div class="tasks-grid">' + mostrar.map(t => cardTarefa(t)).join('') + '</div>';
  if (ocultas > 0 && !expandir) {
    html += `<button class="ver-mais-btn" onclick="setExpandirTarefas(true);renderDashboard(usuarioAtual)">🔽 Ver mais ${ocultas} tarefa(s)</button>`;
  } else if (expandir && urgentes.length < tasks.length) {
    html += `<button class="ver-mais-btn" onclick="setExpandirTarefas(false);renderDashboard(usuarioAtual)">🔼 Mostrar só urgentes</button>`;
  }
  el.innerHTML = html;
}

function relogioSP(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  function atualizar() {
    const agora = new Date();
    const sp = agora.toLocaleString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    el.textContent = '🕐 ' + sp;
  }
  atualizar();
  setInterval(atualizar, 1000);
}

function contagemRegressiva(data, label, icone) {
  const hoje = getHojeSP();
  const alvo = new Date(data);
  const diff = Math.ceil((alvo - hoje) / (1000 * 60 * 60 * 24));
  const passed = diff <= 0;
  return `
    <div class="countdown-item ${passed ? 'passed' : 'highlight'}">
      <div class="days">${passed ? '✅' : 'Faltam ' + diff + ' dias'}</div>
      <div class="label">${icone} ${label}<br>${formatarDataSP(data)}</div>
    </div>
  `;
}

function termometro(atual, meta, label) {
  const pct = Math.round((atual / meta) * 100);
  return `
    <div class="mobilizacao-card">
      <div class="num">${atual}/${meta}</div>
      <div class="label">${label}</div>
      <div class="progress-bar" style="margin-top:8px;"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="font-size:0.62em;color:var(--text-muted);margin-top:2px;">${pct}%</div>
    </div>
  `;
}

function checklist(itens, storagePrefix) {
  return itens.map(item => {
    const key = storagePrefix + '_' + item.tarefa.replace(/\s+/g, '_').toLowerCase();
    const done = localStorage.getItem(key) === 'true';
    return `
      <div class="checklist-item ${done ? 'done' : ''}" onclick="toggleChecklist('${key}', this)">
        <div class="box">${done ? '✓' : ''}</div>
        <div class="cl-text">${item.tarefa}</div>
        <div class="cl-prazo ${item.urgente ? 'urgent' : ''}">📅 ${item.prazo} • ${item.responsavel}</div>
      </div>
    `;
  }).join('');
}

function toggleChecklist(key, el) {
  el.classList.toggle('done');
  const done = el.classList.contains('done');
  el.querySelector('.box').textContent = done ? '✓' : '';
  localStorage.setItem(key, done);
}

function safeRender(fn, nomePainel, elemento) {
  try {
    const html = fn();
    if (elemento) elemento.innerHTML = html;
    return html;
  } catch (err) {
    console.error('❌ Painel ' + nomePainel + ' falhou:', err);
    if (elemento) {
      elemento.innerHTML = '<div class="panel-error"><span>⚠️</span><p>Erro ao carregar <strong>' + nomePainel + '</strong></p><button class="btn primary small" onclick="location.reload()">Tentar novamente</button></div>';
    }
    return null;
  }
}

function renderBadgeOffline() {
  return isOffline() ? '<span class="badge-offline">📡 Offline</span>' : '<span class="update-badge">🟢 Ao vivo</span>';
}