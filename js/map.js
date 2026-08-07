// ═══════════════════════════════════════════════════════════
// MAP.JS — Mapa SVG das Zonas Eleitorais
// ═══════════════════════════════════════════════════════════

const ZONAS = [
  { id: '065', nome: 'Centro', eleitores: 120000, meta: 3334, cor: '#e11d48' },
  { id: '281', nome: 'Vila Hortolândia', eleitores: 105000, meta: 3333, cor: '#8b5cf6' },
  { id: '424', nome: 'São Camilo', eleitores: 102491, meta: 3333, cor: '#f59e0b' },
];

function renderMapa() {
  const el = document.getElementById('mapa-zonas');
  if (!el) return;
  const votos2022 = 1944;
  const meta2026 = 10000;
  el.innerHTML = `
    <div class="map-container">
      <svg viewBox="0 0 400 320" style="max-width:100%;height:auto;">
        <rect x="0" y="0" width="400" height="320" fill="none" />
        <!-- Zona 065 - Centro -->
        <path d="M50,40 L180,40 L180,160 L50,160 Z" fill="rgba(225,29,72,0.25)" stroke="#e11d48" stroke-width="2" class="zona" onclick="mostrarZona('065')"/>
        <text x="115" y="105" text-anchor="middle" fill="#e11d48" font-size="13" font-weight="700">Zona 065</text>
        <text x="115" y="120" text-anchor="middle" fill="#e2e8f0" font-size="10">Centro</text>
        <!-- Zona 281 - Vila Hortolândia -->
        <path d="M190,40 L350,40 L350,180 L190,180 Z" fill="rgba(139,92,246,0.25)" stroke="#8b5cf6" stroke-width="2" class="zona" onclick="mostrarZona('281')"/>
        <text x="270" y="115" text-anchor="middle" fill="#8b5cf6" font-size="13" font-weight="700">Zona 281</text>
        <text x="270" y="130" text-anchor="middle" fill="#e2e8f0" font-size="10">Vila Hortolândia</text>
        <!-- Zona 424 - São Camilo -->
        <path d="M50,170 L280,170 L280,300 L50,300 Z" fill="rgba(245,158,11,0.25)" stroke="#f59e0b" stroke-width="2" class="zona" onclick="mostrarZona('424')"/>
        <text x="165" y="240" text-anchor="middle" fill="#f59e0b" font-size="13" font-weight="700">Zona 424</text>
        <text x="165" y="255" text-anchor="middle" fill="#e2e8f0" font-size="10">São Camilo</text>
      </svg>
      <div id="zona-info" class="zona-info">👆 Clique numa zona para ver detalhes</div>
    </div>
  `;
}

function mostrarZona(zonaId) {
  const zona = ZONAS.find(z => z.id === zonaId);
  if (!zona) return;
  const info = document.getElementById('zona-info');
  if (!info) return;
  const pctMeta = Math.round(1944 / 10000 * 100);
  info.innerHTML = `
    <strong style="color:${zona.cor}">Zona ${zona.id} — ${zona.nome}</strong><br>
    🗳️ ${zona.eleitores.toLocaleString()} eleitores<br>
    🎯 Meta: ~${zona.meta.toLocaleString()} votos (${Math.round(zona.meta/10000*100)}% dos 10.000)<br>
    📊 2022: 1.944 votos na cidade (${pctMeta}% da meta)
  `;
}