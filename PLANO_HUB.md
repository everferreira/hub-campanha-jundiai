# PLANO DE ARQUITETURA — HUB CAMPANHA ERIKA HILTON JUNDIAÍ

> **Versão:** 1.0 — 07/08/2026
> **Autor:** Hermes Agent + Ever Maria
> **Repositório:** github.com/refundarjundiai/hub-campanha-jundiai
> **URL:** https://refundarjundiai.github.io/hub-campanha-jundiai/
> **Tecnologia:** HTML + CSS + JS puro (SPA — Single Page Application)
> **Hospedagem:** GitHub Pages
> **"Banco de dados":** Arquivos JSON estáticos + GitHub API

---

## 1. VISÃO GERAL

### 1.1. Objetivo
Substituir o monólito HTML atual (2600+ linhas) por uma **SPA modular** onde cada membro da equipe tem um painel personalizado de acordo com seu nível de acesso, com sincronização em tempo real via GitHub API.

### 1.2. Princípios de Design
1. **Cada pessoa vê o que precisa** — nada de informação irrelevante poluindo a tela
2. **Mobile-first** — a equipe acessa pelo celular
3. **Offline-friendly** — dados em localStorage, sincroniza quando puder
4. **Zero backend** — tudo via GitHub Pages + API
5. **Tema escuro** — cansa menos os olhos, parece profissional

---

## 2. ARQUITETURA DE ARQUIVOS

```
hub-campanha-jundiai/
│
├── index.html                 # Casca da SPA (login + container vazio)
│
├── css/
│   ├── style.css              # Guia visual: variáveis, tipografia, layout base
│   └── widgets.css            # Componentes: cards, modais, termômetros, checklists
│
├── js/
│   ├── auth.js                # Login, sessão, controle de nível
│   ├── db.js                  # 🆕 Gerenciamento: fetch db.json > cache localStorage > fallback data.FALLBACK.js
│   ├── utils.js               # Utilitários: ordenação, timezone SP, formatação, localStorage helpers
│   ├── components.js          # Componentes reutilizáveis (card, modal, checklist, termômetro, toggle)
│   ├── sync.js                # Sincronização: ler/escrever no GitHub API
│   ├── map.js                 # Mapa das zonas eleitorais (SVG interativo)
│   ├── app.js                 # Orquestrador: renderiza painéis por perfil + roteamento SPA
│   └── data.FALLBACK.js       # ⚠️ Backup offline (usado se fetch do db.json falhar)
│
├── data/
│   ├── db.json                # ✅ FONTE ÚNICA DA VERDADE — Hermes só altera aqui
│   └── completions.json       # Histórico de conclusões (sincronizado)
│
├── assets/
│   └── map-zonas.svg          # SVG interativo das 3 zonas eleitorais de Jundiaí
│
├── ata-comunicacao-0608.md    # ATA da reunião
├── setup-token.sh             # Gera token.js (gitignorado)
├── token.js                   # Token GitHub (gitignorado — NÃO commitar)
├── drive_upload.py            # Script de upload pro Drive
└── .gitignore
```

---

## 3. SISTEMA DE LOGIN E PERFIS

### 3.1. Tela de Login
- Grade com avatares (ícone + nome) para cada perfil — **mais visual que dropdown**
- Ao clicar no perfil, abre campo de senha
- Senha geral: `erika2026` (cada um pode mudar a sua via localStorage)
- Após login, mostra saudação personalizada com relógio SP
- Botão "Sair" no cabeçalho limpa sessão e recarrega
- Sessão salva no localStorage (`hub_session`)

### 3.2. Níveis de Acesso

| Nível | Quem | O que vê |
|:-----:|------|----------|
| **5** | Ever Maria, Tiana Cauton | Tudo: visão 360, finanças, eleitoral, parceiros, todas as tarefas |
| **3** | Junior, Hoanny, João | Painéis específicos da função + parceiros |
| **2** | Kawa, Eva | Só o painel de produção + engajamento + conteúdo |

### 3.3. Perfis e Seus Painéis

#### 👑 Ever Maria & Tiana Cauton (Nível 5) — "Visão 360"
**O que veem:**
- Termômetro Eleitoral (1.944 → 10.000)
- Contagem regressiva (16/08, 18/08, 22/08, 04/10)
- Matriz de Tarefas — filtro por responsável
- Painel Financeiro (gastos previstos vs saldo)
- Emendas detalhadas (R$ 4,6M)
- Notícias da campanha
- Parceiros (Cardume, Henrique Parra, Dona Edna)
- Agenda 18/08
- Sincronização de conclusões
- Links administrativos (planilha, drive restrito)

#### 🎨 Eva (Nível 2) — "Painel de Criação"
**O que vê:**
- Fila de produção (lotes, ordenados por urgência)
- Alerta: "Artes estáticas precisam de aprovação da House of Hilton"
- Modal de produção (com referências, legendas, guia visual)
- Guia Visual rápido (cores, fontes, formatos)
- Link direto pro Drive de Fotos
- Engajamento diário (comentar Sofia)

#### 🎬 Kawa (Nível 2) — "Painel de Vídeos"
**O que vê:**
- Cronômetro SLA (4h) — tracker visual de tempo desde a gravação
- Central de Roteiros (5 scripts de Reels em modal)
- Fila de produção (só vídeos)
- Checklist diário de engajamento (responder comentários, curtir/repostar Erika + Sofia)
- Radar: "18/08 — acompanhar Erika, Sofia e Tiana o dia todo"

#### 📅 Hoanny (Nível 3) — "Painel de Eventos"
**O que vê:**
- Contagem regressiva (16/08, 18/08, 22/08)
- Checklist Bandeiraço (10 itens)
- Checklist Lançamento 22/08 (logística ônibus)
- Rolodex de parceiros (Cardume, Henrique Parra, Dona Edna)
- Tarefas de eventos

#### 💰 João (Nível 3) — "Painel Financeiro"
**O que vê:**
- Painel de gastos previstos vs arrecadado
- Detalhamento de emendas (R$ 4,6M)
- Detalhamento de gastos da campanha
- Aviso: "Despachos financeiros são presenciais com Tiana"
- Tarefas financeiras

#### 🗺️ Junior (Nível 3) — "Painel de Mobilização"
**O que vê:**
- Mapa estratégico das 3 zonas (065-Centro, 281-Vila Hortolândia, 424-São Camilo)
- Meta por zona (~3.334 votos cada)
- Termômetro de mobilização (confirmações, lideranças, bairros)
- Checklist de lideranças
- Tarefas de mobilização

---

## 4. MODELO DE DADOS (db.json)

### 4.1. Estrutura Completa do db.json

```json
{
  "metadados": {
    "versao": "2.0",
    "ultima_atualizacao": "2026-08-07T16:00:00-03:00",
    "timezone": "America/Sao_Paulo"
  },

  "campanha": {
    "nome": "Erika Hilton 2026 — Jundiaí",
    "email": "refundarjundiai@gmail.com",
    "github": "refundarjundiai",
    "hub_url": "https://refundarjundiai.github.io/hub-campanha-jundiai/",
    "senha_geral": "erika2026",
    "eleicao": "2026-10-04",
    "datas_importantes": [
      { "data": "2026-08-16", "evento": "Bandeiraço", "icone": "🚩" },
      { "data": "2026-08-18", "evento": "Visita Erika a Jundiaí", "icone": "🎯" },
      { "data": "2026-08-22", "evento": "Lançamento Oficial da Campanha", "icone": "🚀" },
      { "data": "2026-10-04", "evento": "1º Turno — Eleição", "icone": "🗳️" }
    ]
  },

  "equipe": [
    { "id": "ever", "nome": "Ever Maria", "funcao": "Coordenadora Municipal", "nivel": 5, "cor": "#e11d48", "iniciais": "EM" },
    { "id": "tiana", "nome": "Tiana Cauton", "funcao": "Assessora", "nivel": 5, "cor": "#8b5cf6", "iniciais": "TC" },
    { "id": "junior", "nome": "Junior Arcanjo", "funcao": "Mobilizador de Rua", "nivel": 3, "cor": "#f59e0b", "iniciais": "JA" },
    { "id": "hoanny", "nome": "Hoanny", "funcao": "Eventos", "nivel": 3, "cor": "#3b82f6", "iniciais": "HO" },
    { "id": "joao", "nome": "João", "funcao": "Financeiro", "nivel": 3, "cor": "#10b981", "iniciais": "JO" },
    { "id": "kawa", "nome": "Kawa", "funcao": "Redes Sociais — Vídeos", "nivel": 2, "cor": "#06b6d4", "iniciais": "KA" },
    { "id": "eva", "nome": "Eva", "funcao": "Redes Sociais — Artes", "nivel": 2, "cor": "#ec4899", "iniciais": "EV" }
  ],

  "tarefas": [
    {
          "id": "t001",
          "titulo": "Card convocação Bandeiraço 16/08",
          "tipo": "producao",
          "responsavel": "eva",
          "prazo": "2026-08-04",
          "urgencia": "urgent",
          "lote": "🔴 Emergência",
          "status": "pendente",
          "hoh_status": "pending",
          "refs": ["drive", "instaLocal"],
          "legenda_key": "bandeiraco",
          "reels_key": null,
          "descricao": "Card estático. Precisa de aprovação da House of Hilton."
        },
    // ... +47 tarefas de produção + 22 tarefas gerais
  ],

  "publicacoes": [
    {
      "id": "p001",
      "data": "2026-08-07",
      "horario": "13h",
      "tema": "🚩 Bandeiraço 16/08 — CONVOCAÇÃO",
      "formato": "Card",
      "fase": "Pré-campanha",
      "responsavel": ["eva"],
      "legenda_key": "bandeiraco"
    }
    // ... +46 posts (total 47)
  ],

  "engajamento": [
    { "id": "e001", "tarefa": "Responder TODOS os comentários das postagens", "responsavel": "quem_postou" },
    { "id": "e002", "tarefa": "Comentar 2 posts da Erika (@hilton_erika)", "responsavel": "kawa" },
    { "id": "e003", "tarefa": "Comentar 2 posts da Sofia Favaro", "responsavel": "eva" },
    { "id": "e004", "tarefa": "Compartilhar posts oficiais (Erika+Sofia) nos stories", "responsavel": "ambos" },
    { "id": "e005", "tarefa": "Verificar engajamento e salvar stories em destaque", "responsavel": "ambos" }
  ],

  "eleitoral": {
    "votos_2022": 1944,
    "meta_2026": 10000,
    "eleitores": 327491,
    "zonas": [
      { "id": "065", "nome": "Centro", "eleitores": 120000 },
      { "id": "281", "nome": "Vila Hortolândia", "eleitores": 105000 },
      { "id": "424", "nome": "São Camilo", "eleitores": 102491 }
    ],
    "boulos_ref": 6375,
    "emendas_total": 4639036,
    "emendas_2026": 2700000,
    "emendas_detalhadas": [
      { "valor": 680000, "destino": "Oftalmologia infantil (zerar fila de crianças com óculos)", "articulacao": "Cardume / Henrique Parra" },
      { "valor": 320000, "destino": "Centro de Diagnóstico do TEA (Autismo)", "articulacao": "Cardume / Henrique Parra" },
      { "valor": 1000000, "destino": "CTA — Testagem HIV, sífilis, hepatites", "articulacao": "Tiana Cauton" }
    ]
  },

  "agenda_visita": [
    { "hora": "11:00-11:40", "atividade": "Visita PA Vila Progresso", "local": "Verba destinada por Erika" },
    { "hora": "12:00-13:00", "atividade": "Instituto Luís Braile", "local": "Com Movimento Cardume" },
    { "hora": "13:30-14:30", "atividade": "Visita Centro TEA (Girassóis)", "local": "Centro Integrado Girassóis" },
    { "hora": "15:00-16:30", "atividade": "Almoço", "local": "" },
    { "hora": "16:30-17:00", "atividade": "🎤 Coletiva de Imprensa", "local": "", "destaque": true },
    { "hora": "17:30", "atividade": "🤝 Encontro com Lideranças", "local": "Bancários", "destaque": true },
    { "hora": "19:00", "atividade": "🎉 Encontro Aberto", "local": "Clube 28 de Setembro", "destaque": true }
  ],

  "checklist_bandeiraco": [
    { "tarefa": "Definir local do bandeiraço", "prazo": "05/08", "responsavel": "Ever Maria", "urgente": true },
    { "tarefa": "Definir horário do bandeiraço", "prazo": "05/08", "responsavel": "Ever Maria", "urgente": true },
    { "tarefa": "Conseguir material de campanha", "prazo": "10/08", "responsavel": "Junior Arcanjo" },
    { "tarefa": "Montar equipe de apoio (5-10 pessoas)", "prazo": "10/08", "responsavel": "Tiana Cauton" },
    { "tarefa": "Criar evento no Instagram e WhatsApp", "prazo": "08/08", "responsavel": "Kawa" },
    { "tarefa": "Disparar convite em massa", "prazo": "10/08", "responsavel": "Junior Arcanjo" },
    { "tarefa": "Combinar discurso/rota com equipe", "prazo": "14/08", "responsavel": "Ever Maria" },
    { "tarefa": "Levar caixa de som + microfone", "prazo": "15/08", "responsavel": "Hoanny" },
    { "tarefa": "Cobertura stories (Eva + Kawa)", "prazo": "16/08", "responsavel": "Eva, Kawa" },
    { "tarefa": "Pós-evento: fotos e relatório", "prazo": "17/08", "responsavel": "Kawa" }
  ],

  "mobilizacao": {
    "confirmados": { "atual": 42, "meta": 100, "label": "Confirmações Bandeiraço" },
    "liderancas": { "atual": 8, "meta": 25, "label": "Lideranças contatadas" },
    "bairros": { "atual": 5, "meta": 15, "label": "Bairros alcançados" },
    "voluntarios": { "atual": 12, "meta": 30, "label": "Voluntários ativos" }
  },

  "financas": {
    "arrecadado": 0,
    "previsto": 15000,
    "gastos": [
      { "item": "Material gráfico (bandeiras, adesivos)", "valor": 2500 },
      { "item": "Transporte equipe", "valor": 1800 },
      { "item": "Alimentação dia da visita", "valor": 1200 },
      { "item": "Caixa de som + microfone", "valor": 800 },
      { "item": "Imprevistos", "valor": 1000 }
    ]
  },

  "conteudo_pronto": {
    "legendas": { /* 28 legendas — copiadas do hub atual */ },
    "hashtags": {
      "geral": ["#ErikaHilton", "#Jundiaí", "#PSOL", "#Eleições2026"],
      "atuacao": ["#DeputadaFederal", "#MelhorDeputada", "#MulheresNaPolítica"],
      "emendas": ["#Emendas", "#SaúdePública", "#Recursos"],
      "lgbtqia": ["#Orgulho", "#ParadaLGBT", "#DireitosHumanos", "#LGBTQIA+"],
      "eleicao": ["#VotaErika", "#JundiaíDecide", "#VotoConsciente", "#04DeOutubro"],
      "mulher": ["#ComissãoDaMulher", "#DireitosDasMulheres", "#Transfeminicídio"],
      "visita": ["#ErikaEmJundiaí", "#AgendaErika", "#VisitaErika"]
    },
    "scripts_reels": { /* 5 scripts do hub atual */ },
    "guia_visual": {
      "cores": { "primaria": "#e11d48", "secundaria": "#8b5cf6", "fundo": "#0b0f19", "texto": "#e2e8f0", "destaque": "#f59e0b" },
      "fonte": "Inter",
      "formatos": { "carrossel": "1080x1080", "card": "1080x1080", "story": "1080x1920", "reels": "1080x1920" }
    }
  },

  "noticias": [
    {
      "titulo": "Erika Hilton destina R$ 2 milhões para Saúde de Jundiaí",
      "fonte": "Tribuna de Jundiaí",
      "url": "https://tribunadejundiai.com.br/politica/erika-hilton-emendas-para-jundiai"
    }
    // +4 notícias
  ],

  "parceiros": [
    { "nome": "Coletivo Cardume", "descricao": "Movimento social parceiro. Articulou R$ 1M em emendas.", "contato": "Henrique Parra" },
    { "nome": "Henrique Parra", "descricao": "Vereador (PSOL) — 5.939 votos.", "contato": "" },
    { "nome": "Dona Edna — Clube 28 de Setembro", "descricao": "Espaço do Encontro Aberto em 18/08 (19h).", "contato": "Contatar até 12/08" }
  ],

  "links": {
    "drive_atas": "https://drive.google.com/drive/folders/1TiZdbyXbuhBjBPr8ZFoP7Xmfe1s3aWuB",
    "drive_fotos": "https://drive.google.com/drive/folders/1mH9jxdkCWrK_KYHwZCIFv-flMedirOFR",
    "notion": "https://notion.so/3ae6bd5dbb788131ba9ddc2c6d0c1d59",
    "planilha": "https://docs.google.com/spreadsheets/d/1Y60DrMPeepBqAfeuhQQK8WA14dzdXMagaoMFMJGYIMo",
    "insta_oficial": "https://instagram.com/hilton_erika",
    "insta_local": "https://instagram.com/erikahiltonjundiai",
    "site_oficial": "https://erikahilton.com.br/",
    "camara": "https://www.camara.leg.br/deputados/220645",
    "wikipedia": "https://pt.wikipedia.org/wiki/Erika_Hilton"
  }
}
```

---

## 5. FUNCIONALIDADES POR MÓDULO

### 5.1. Módulo: Login e Autenticação (auth.js)
- [ ] Tela de login com select de perfil + senha
- [ ] Sessão persistente (localStorage)
- [ ] Botão "Sair"
- [ ] Mudar senha individual (localStorage)
- [ ] Seção de Avisos/Recados no topo (Ever posta mensagens visíveis a todos)

### 5.2. Módulo: Utilitários e Estado (utils.js)
- [ ] `getHojeSP()` — data/hora atual em São Paulo
- [ ] `ordenarTarefas(lista)` — atrasadas > hoje > amanhã > urgente > normal > contínuo
- [ ] `formatarDataSP(data)` — formato pt-BR
- [ ] `salvarEstado(chave, valor)` / `carregarEstado(chave)` — localStorage tipado
- [ ] Estado do "Ver Mais" persistido por usuário
- [ ] `ultimaVisita` — timestamp ao logar (pra saber quem viu)
- [ ] `debounce(fn, ms)` — pra evitar múltiplas chamadas

### 5.3. Módulo: Componentes (components.js)
- [ ] `cardTarefa(tarefa)` — card com borda colorida por tipo (🎨 Arte, 🎬 Vídeo, 📱 Publicar, 💬 Engajar, 📋 Tarefa)
- [ ] `modalProdutivo(tarefa)` — modal de produção com referências + legendas + roteiro
- [ ] `modalLegenda(key)` — legenda com botão copiar (clipboard API)
- [ ] `modalScript(key)` — roteiro de Reels
- [ ] `termometro(atual, meta, label)` — barra de progresso
- [ ] `checklist(itens)` — lista com checkboxes
- [ ] `toggleSecao(id, label)` — seção colapsável
- [ ] `filtroChips(opcoes, ativo, onChange)` — filtro tipo chips
- [ ] `relogioSP(elementId)` — relógio SP ao vivo
- [ ] `contagemRegressiva(data, label)` — dias até o evento
- [ ] `skeletonLoader()` — placeholder de carregamento
- [ ] `houseOfHiltonStatus(tarefa)` — badge 🔴 pendente / 🟢 aprovado
- [ ] `badgeSync(pendentes)` — badge de sincronização

### 5.4. Módulo: Painel Ever/Tiana — Visão 360
- [ ] Saudação personalizada com relógio SP
- [ ] Contagem regressiva dos 4 marcos
- [ ] Termômetro eleitoral (1.944 → 10.000)
- [ ] Meta desdobrada por zona
- [ ] Matriz de Tarefas (filtro por responsável + toggle urgente)
- [ ] Painel financeiro (arrecadado vs gastos)
- [ ] Emendas detalhadas
- [ ] Notícias da campanha
- [ ] Parceiros
- [ ] Agenda 18/08
- [ ] Histórico de conclusões + botão sincronizar
- [ ] Links administrativos

### 5.5. Módulo: Painel Eva — Artes
- [ ] Fila de produção (só tarefas da Eva, ordenadas por urgência)
- [ ] Alerta "House of Hilton" para artes estáticas
- [ ] Modal de produção (referências + legendas + guia visual)
- [ ] Guia Visual (cores, fontes, formatos)
- [ ] Link direto: Drive de Fotos
- [ ] Engajamento diário (comentar Sofia)

### 5.6. Módulo: Painel Kawa — Vídeos
- [ ] Fila de produção (só tarefas do Kawa)
- [ ] Cronômetro SLA (4h) desde a última gravação
- [ ] Central de Roteiros (5 scripts em modal rápido)
- [ ] Checklist diário de engajamento
- [ ] Alerta: "18/08 — acompanhar Erika, Sofia e Tiana"

### 5.7. Módulo: Painel Hoanny — Eventos
- [ ] Contagem regressiva dos eventos
- [ ] Checklist Bandeiraço (10 itens)
- [ ] Checklist Lançamento 22/08 (logística ônibus)
- [ ] Rolodex de parceiros (Cardume, Henrique, Dona Edna)

### 5.8. Módulo: Painel João — Finanças
- [ ] Gastos previstos vs arrecadado
- [ ] Detalhamento de emendas (R$ 4,6M)
- [ ] Detalhamento gastos campanha
- [ ] Aviso: despachos presenciais com Tiana

### 5.9. Módulo: Painel Junior — Mobilização
- [ ] Mapa das 3 zonas eleitorais (Leaflet.js ou SVG interativo)
- [ ] Meta por zona (~3.334 votos)
- [ ] Termômetro de rua (confirmações, lideranças, bairros)
- [ ] Checklist de lideranças

### 5.10. Módulo: Conteúdo Pronto (visível para nível 2+)
- [ ] Lista de legendas (28) — modal com botão copiar
- [ ] Hashtags por tema (7 grupos) — copiar
- [ ] Scripts de Reels (5) — modal
- [ ] Guia Visual — cores, fontes, formatos

### 5.12. Módulo: Quem Somos (visível para todos)
- [ ] Breve descrição do comitê municipal
- [ ] Lista da equipe com nomes e funções
- [ ] Valores da campanha (Representatividade, Luta por direitos, Saúde pública, Cidade para todos)

### 5.13. Módulo: Avisos e Recados (visível para todos)
- [ ] Ever posta mensagens no topo do hub
- [ ] Salvos em localStorage, visíveis a todos
- [ ] Suporta formatação básica (negrito, emoji)

### 5.14. Módulo: SLA Kawa — Cronômetro de 4h
- [ ] Quando Kawa marca tarefa como "gravando", inicia cronômetro de 4h
- [ ] Barra de progresso visual (verde → amarelo → vermelho)
- [ ] Alerta se passar das 4h
- [ ] Reset quando tarefa é concluída

### 5.15. ⭐ INOVAÇÃO: Clima da Campanha
- [ ] Ever define o status atual: 🔴 Crítico / 🟡 Alerta / 🟢 Normal / 🎉 Comemorando
- [ ] Muda a cor de destaque do hub (accent color) dinamicamente
- [ ] Visível no topo pra todos — "clima" do dia
- [ ] Salvo em localStorage, persistente entre sessões

### 5.16. ⭐ INOVAÇÃO: Diário de Bordo (Campaign Timeline)
- [ ] Feed cronológico mostrando: tarefas concluídas, posts publicados, decisões
- [ ] Puxa dados do `completions.json` + localStorage
- [ ] Cada conclusão vira um card no timeline: "✅ Eva concluiu 'Card Bandeiraço' (07/08 14h)"
- [ ] Visível na Visão 360 (Ever/Tiana) e modo resumo pra todos
- [ ] Botão "Compartilhar resumo do dia" — gera texto copiável pro WhatsApp

### 5.17. ⭐ INOVAÇÃO: Modo Foco
- [ ] Um botão no topo: "🎯 Modo Foco"
- [ ] Quando ativo, esconde TUDO que não é 🔴 urgente ou 🔥 atrasado
- [ ] Tela limpa, só o essencial — pra quando o caos bater
- [ ] Atalho no teclado: `F` (de foco)

### 5.18. ⭐ INOVAÇÃO: Conquistas e Progresso (Gamificação)
- [ ] Badges que o time ganha ao atingir marcos:
  - 🔥 **Turbinado** — 5 tarefas concluídas em 1 dia
  - ⭐ **Estrela** — 10 tarefas concluídas no total
  - 🏆 **Lenda** — Nenhuma tarefa atrasada por 1 semana
  - 📸 **Primeiro Post** — 1ª publicação feita
  - 🚀 **Lançamento** — Participou do lançamento 22/08
- [ ] Cada badge aparece no perfil da pessoa
- [ ] Visível no painel de cada um: "Suas conquistas"

### 5.19. ⭐ INOVAÇÃO: Cartão de Visita Digital
- [ ] Cada membro tem um "cartão" com: nome, função, foto (emoji), badges
- [ ] Botão "📇 Meu Cartão" — abre um modal bonito
- [ ] Dá pra compartilhar como imagem (via HTML2Canvas ou screenshot)

### 5.20. ⭐ INOVAÇÃO: Toque de Reunir
- [ ] Ever ativa um banner pulsante visível a todos: "🔔 Ever quer reunir!"
- [ ] Aparece no topo de todos os painéis, com a mensagem
- [ ] Cada um clica "Já vi" pra dismiss
- [ ] Ideal pra convocações rápidas sem precisar do WhatsApp

---

## 6. SISTEMA DE SINCRONIZAÇÃO (sync.js)

### 6.1. Fluxo
1. **Ao carregar:** busca `completions.json` do GitHub (raw)
2. **Ao concluir tarefa:** salva no localStorage + marca como pendente
3. **Botão "Sincronizar":** envia pendentes pro GitHub via API
4. **Token:** lido do `token.js` (gitignorado, gerado por `setup-token.sh`)

### 6.2. Arquivo completions.json
```json
[
  {
    "tarefa": "Card convocação Bandeiraço 16/08",
    "responsavel": "eva",
    "concluidaEm": "2026-08-07T14:30:00-03:00",
    "timestamp": 1786123800000
  }
]
```

### 6.3. Segurança
- Token nunca commitado (`.gitignore`)
- Gerado localmente via `gh auth token`
- Escopo mínimo: `repo` (só esse repositório)

---

## 7. UX/UI — DIRETRIZES DE DESIGN

### 7.1. Guia Visual
| Elemento | Valor |
|----------|-------|
| **Fundo** | `#0b0f19` (preto azulado profundo) |
| **Superfície** | `#151c2c` (cards) |
| **Borda** | `#1e293b` |
| **Primária** | `#e11d48` (vermelho campanha) |
| **Secundária** | `#8b5cf6` (roxo diversidade) |
| **Destaque** | `#f59e0b` (dourado) |
| **Sucesso** | `#10b981` (verde) |
| **Texto** | `#e2e8f0` |
| **Texto secundário** | `#64748b` |
| **Fonte** | Inter (Google Fonts) |
| **Border-radius** | 12px (cards), 8px (botões) |

### 7.2. Mobile-First
- Breakpoint: 640px
- Grid: 1 coluna no mobile, 2-3 colunas no desktop
- Navegação: bottom nav no mobile, top nav no desktop
- Touch targets: mínimo 44px

### 7.3. Princípios de UX (do histórico da campanha)
- [ ] **NUNCA mostrar níveis de acesso** na interface — apenas o cargo da pessoa
- [ ] **Tiana tem o mesmo acesso que Ever** (não diferenciar visualmente)
- [ ] **Tema escuro** — cansa menos os olhos, parece profissional
- [ ] **Feedback imediato** para cada ação (toast "✅ Concluído!", "📤 Sincronizando...")
- [ ] **Estado vazio amigável** — quando não há tarefas, mostrar mensagem positiva
- [ ] **Tudo em português** — sem technical jargon

### 7.4. Responsividade
- [ ] Cards em grid adaptável
- [ ] Modais ocupam tela cheia no mobile
- [ ] Checklist com padding generoso pra toque
- [ ] Filtros como chips roláveis horizontalmente

### 7.4. Estados de Carregamento e Erro
- [ ] **Skeleton loaders** enquanto dados carregam (evita layout shift)
- [ ] **Mensagem de erro amigável** se GitHub API falhar (com botão "Tentar novamente")
- [ ] **Fallback offline** — dados do localStorage se fetch falhar
- [ ] **Badge "cache"** indicando se dados são do cache ou ao vivo
- [ ] **Toast notifications** para feedback de ações (concluído, sincronizado, erro)

### 7.5. Performance
- [ ] CSS crítico inline no `<head>` (evita flash de conteúdo não estilizado)
- [ ] Carregamento sob demanda (lazy loading) de seções não-visíveis
- [ ] `IntersectionObserver` para renderizar apenas o que está na tela
- [ ] `debounce` em inputs de busca/filtro (300ms)

---

## 8. CRONOGRAMA DE IMPLANTAÇÃO

### Fase 1 — Esqueleto (agora)
- [ ] Criar estrutura de diretórios
- [ ] `index.html` — casca da SPA
- [ ] `auth.js` — login funcional
- [ ] `style.css` + `widgets.css` — tema visual
- [ ] `data/db.json` — dados completos
- [ ] `data.js` — TODOS os dados (migrar do hub atual)

### Fase 2 — Componentes Base
- [ ] `utils.js` — ordenação, timezone, helpers
- [ ] `components.js` — card, modal, termômetro, checklist, toggle
- [ ] Relógio SP
- [ ] Contagem regressiva
- [ ] Skeleton loaders + toasts

### Fase 3 — Painéis Individuais
- [ ] Visão 360 (Ever/Tiana)
- [ ] Painel Eva (Artes)
- [ ] Painel Kawa (Vídeos)
- [ ] Painel Hoanny (Eventos)
- [ ] Painel João (Finanças)
- [ ] Painel Junior (Mobilização)
- [ ] Mapa SVG das zonas eleitorais

### Fase 4 — Conteúdo + Sincronização
- [ ] Conteúdo Pronto (legendas, hashtags, scripts, guia)
- [ ] Publicações (calendário + filtros)
- [ ] `sync.js` — GitHub API
- [ ] Histórico de conclusões
- [ ] Clima da Campanha
- [ ] Toque de Reunir

### Fase 5 — Inovação + Polimento
- [ ] Diário de Bordo (timeline)
- [ ] Modo Foco
- [ ] Conquistas e Gamificação
- [ ] Cartão de Visita Digital
- [ ] Testes em mobile
- [ ] Ajustes de responsividade
- [ ] Performance (lazy loading)
- [ ] Deploy final + celebração 🚀

---

## 9. INTEGRAÇÕES

| Integração | Como | O quê |
|------------|------|-------|
| **GitHub API** | `sync.js` + `token.js` | Salvar conclusões |
| **Google Drive** | Links diretos + `drive_upload.py` | ATAs, fotos |
| **Notion** | Link direto | Documento estratégico |
| **Instagram** | Links diretos | Perfis oficiais |
| **Leaflet.js** | CDN no `index.html` | Mapa das zonas (Junior) |
| **Tavily** | (futuro) | Notícias automáticas |

---

## 10. LIMITAÇÕES E CONTORNOS

| Limitação | Contorno |
|-----------|----------|
| GitHub Pages não tem backend | Tudo em JS puro, dados em JSON estático |
| API do GitHub tem rate limit | Cache em localStorage, sincronização manual, botão "Tentar novamente" |
| Token exposto no JS | `token.js` gitignorado, gerado localmente via `gh auth token` |
| Sem banco de dados | `completions.json` como "banco" via GitHub API |
| Leaflet precisa de tiles online | Substituído por SVG interativo das zonas (não precisa de internet) |
| Sem notificações push | Badge "Cache" + toast "Dados atualizados" ao recarregar |
| Possível conflito de escrita no completions.json | Sincronização manual (botão) + merge local antes de sobrescrever |
| Dados sensíveis (token) | `token.js` no `.gitignore` — nunca commitado |

---

## 12. ESPECIFICAÇÕES TÉCNICAS CRÍTICAS

### 12.1. Ordem de Carregamento dos Scripts
A ordem importa para evitar erros de referência:

```html
<!-- ⚠️ CRÍTICO: Ordem de carregamento -->
<!-- 1º: Auth (define sessão — síncrono) -->
<script src="js/auth.js"></script>
<!-- 2º: Gerenciador de dados (fetch db.json, cache, fallback) -->
<script src="js/db.js" defer></script>
<!-- 3º: Utilitários (funções puras) -->
<script src="js/utils.js" defer></script>
<!-- 4º: Componentes (blocos visuais) -->
<script src="js/components.js" defer></script>
<!-- 5º: Sincronização (API GitHub) -->
<script src="js/sync.js" defer></script>
<!-- 6º: Mapa (SVG interativo) -->
<script src="js/map.js" defer></script>
<!-- 7º: App (orquestrador — ÚLTIMO) -->
<script src="js/app.js" defer></script>
<!-- 8º: Fallback offline (carregado por último, usado só se precisar) -->
<script src="js/data.FALLBACK.js" defer></script>
```

- `auth.js` é síncrono (bloqueante) porque o login é a primeira coisa
- Todos os outros são `defer` para carregar em paralelo, executar em ordem
- `db.js` busca `db.json` via fetch (mesmo origin, sem CORS), cacheia em localStorage, fallback pra `data.FALLBACK.js`
- `data.FALLBACK.js` define `window.FALLBACK_DATA` — usado APENAS se o fetch falhar
- db.json é a FONTE ÚNICA DA VERDADE — Hermes só altera esse arquivo

### 12.2. Performance e Tamanho
| Item | Tamanho estimado | Estratégia |
|------|:----------------:|------------|
| `data.js` (todos os dados) | ~100-150KB | Carregar com `defer`, mostrar skeleton loader |
| `app.js` (lógica dos painéis) | ~30-50KB | Carregar por último |
| `components.js` | ~15-20KB | Reutilizável, minificado |
| Google Fonts (Inter) | ~30KB | `font-display: swap` para evitar invisibilidade |
| SVG mapa zonas | ~5-10KB | Inline no HTML ou arquivo separado |
| **Total** | **~200-250KB** | Aceitável para GitHub Pages. Minificar na Fase 5 |

### 12.3. Estratégia de Cache e Dados (db.js)

O fluxo de dados é gerenciado por `js/db.js`:

```
[Usuário faz login]
       ↓
[db.js: inicia carregamento dos dados]
       ↓
[Fetch /data/db.json?t=TIMESTAMP]  ← cache-busting via timestamp
       ↓
  Sucesso? ──Sim──→ [Cacheia em localStorage: hub_db_cache]
       |                    ↓
      Não              [Atualiza timestamp + re-renderiza]
       |                    
  [Usa window.FALLBACK_DATA] ← data.FALLBACK.js (embutido no HTML)
       |
  [Badge "📡 Offline"] → [Tenta novamente a cada 60s]
```

**Regras:**
- `db.json` é a **fonte única da verdade**
- Fetch acontece sobre **mesmo origin** (refundarjundiai.github.io/hub-campanha-jundiai/data/db.json — sem CORS)
- Cache-busting: `?t=Date.now()` no fetch pra evitar cache do GitHub Pages
- `localStorage.getItem('hub_db_cache')` é usado como fallback **enquanto** o fetch acontece (renderização instantânea)
- Se o fetch falhar e não houver cache, usa `window.FALLBACK_DATA` de `data.FALLBACK.js`
- Se tudo falhar, mostra mensagem de erro amigável com botão "Tentar novamente"
```

### 12.4. CSS Custom Properties (Tema Dinâmico)
Para o "Clima da Campanha" funcionar, o CSS deve usar variáveis:

```css
:root {
  --accent: #e11d48;       /* 🔴 vermelho (padrão) */
  --accent-bg: rgba(225,29,72,0.1);
  --success: #10b981;
  --warning: #f59e0b;
  --surface: #151c2c;
  --text: #e2e8f0;
  --text-secondary: #64748b;
}
```

O Clima da Campanha altera `--accent` via JavaScript:
```js
const climas = {
  critico:  { cor: '#ef4444', label: '🔴 Crítico' },
  alerta:   { cor: '#f59e0b', label: '🟡 Alerta' },
  normal:   { cor: '#10b981', label: '🟢 Normal' },
  festa:    { cor: '#8b5cf6', label: '🎉 Comemorando' }
};
document.documentElement.style.setProperty('--accent', climas[atual].cor);
```

### 12.5. SVG das Zonas Eleitorais (map.js)
Criar um SVG simplificado de Jundiaí com 3 polígonos coloridos:

```svg
<svg viewBox="0 0 400 300">
  <!-- Zona 065 - Centro -->
  <path d="M50,50 L150,50 L150,150 L50,150 Z" 
        fill="rgba(225,29,72,0.3)" stroke="#e11d48" stroke-width="2"
        onclick="selecionarZona('065')" class="zona"/>
  <!-- Zona 281 - Vila Hortolândia -->
  <path d="M160,50 L300,50 L300,180 L160,180 Z" 
        fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" stroke-width="2"
        onclick="selecionarZona('281')" class="zona"/>
  <!-- Zona 424 - São Camilo -->
  <path d="M50,160 L250,160 L250,280 L50,280 Z" 
        fill="rgba(245,158,11,0.3)" stroke="#f59e0b" stroke-width="2"
        onclick="selecionarZona('424')" class="zona"/>
  <!-- Tooltip/Zona info -->
  <text id="zona-info" x="200" y="290" text-anchor="middle" fill="#888" font-size="12">
    Clique numa zona para ver detalhes
  </text>
</svg>
```

- Cada zona é um polígono clicável
- Ao clicar, mostra popup com: nome, eleitores, meta de votos, progresso
- Cores diferentes para cada zona
- `viewBox` permite redimensionar sem perder qualidade

### 12.6. Sincronização — Prevenção de Conflitos
```js
// Fluxo de sincronização
async function sincronizar() {
  // 1. Lê o arquivo atual do GitHub (com SHA)
  const { sha, content: onlineBase64 } = await getArquivoGitHub();
  const online = JSON.parse(atob(onlineBase64));
  
  // 2. Lê conclusões locais pendentes
  const pendentes = getPendentes();
  
  // 3. MERGE: online + pendentes (deduplicado por timestamp)
  const todas = mergeSemDuplicatas(online, pendentes);
  
  // 4. Escreve de volta com o SHA (se mudou, dá erro = alguém escreveu antes)
  const resultado = await escreverGitHub(JSON.stringify(todas), sha);
  
  if (resultado.status === 'conflict') {
    // Se deu conflito, refaz o merge com a versão mais recente
    return sincronizar(); // recursão (no máximo 3 tentativas)
  }
  
  limparPendentes();
  mostrarToast('✅ Sincronizado!');
}
```

### 12.7. Modo Foco — Especificação
- Botão toggle no cabeçalho: `🎯 Modo Foco`
- Quando ativo: `document.body.classList.toggle('modo-foco')`
- CSS:
```css
.modo-foco .task-card:not(.urgent):not(.overdue) { display: none; }
.modo-foco .section-title:not(.urgent-section) { display: none; }
.modo-foco #publicacao-grid { display: none; }
.modo-foco #conteudo-pronto { display: none; }
/* Mostra só saudação + tarefas urgentes/atrasadas */
```
- Atalho: botão no cabeçalho (sem Ctrl+F pra não conflitar com busca do navegador)

### 12.8. Gamificação — Cálculo de Badges
```js
function calcularBadges(usuarioId, completions, tarefas) {
  const badges = [];
  const minhasCompletions = completions.filter(c => c.responsavel === usuarioId);
  const hoje = getHojeSP();
  
  // 🔥 Turbinado: 5+ tarefas no mesmo dia
  const hojeCompletions = minhasCompletions.filter(c => 
    c.concluidaEm.startsWith(hoje.toISOString().slice(0,10))
  );
  if (hojeCompletions.length >= 5) badges.push('🔥 Turbinado');
  
  // ⭐ Estrela: 10+ no total
  if (minhasCompletions.length >= 10) badges.push('⭐ Estrela');
  
  // 🏆 Lenda: nenhuma atrasada por 7 dias
  const ultimos7dias = tarefas.filter(t => /* lógica de prazo */);
  if (ultimos7dias.every(t => t.status !== 'atrasado')) badges.push('🏆 Lenda');
  
  return badges;
}
```

### 12.9. Toque de Reunir — Limitação Técnica
- Funciona apenas no **mesmo navegador** (localStorage)
- Não cross-browser nem push notification (limitação do GitHub Pages)
- Solução: armazenar o "recado" no db.json via GitHub API quando Ever ativa
- Outros hubs leem ao recarregar a página (polling a cada 60s)
- UX: banner pulsante no topo com botão "Já vi"
- Fallback: se não conseguir escrever no GitHub, funciona só local

### 12.10. Compatibilidade com Navegadores
| Feature | Chrome | Firefox | Safari | Edge |
|---------|:------:|:-------:|:------:|:----:|
| localStorage | ✅ | ✅ | ✅ | ✅ |
| fetch | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ | ✅ |
| CSS Custom Properties | ✅ | ✅ | ✅ | ✅ |
| ES6 Modules | ✅ | ✅ | ✅ | ✅ |
| SVG inline | ✅ | ✅ | ✅ | ✅ |
| `defer` scripts | ✅ | ✅ | ✅ | ✅ |

### 12.11. Tratamento de Erros
```js
// Padrão para todas as funções assíncronas
async function safeAsync(fn, fallback, errorMsg) {
  try {
    return await fn();
  } catch (err) {
    console.error(errorMsg, err);
    mostrarToast(`⚠️ ${errorMsg}`, 'erro');
    return fallback;
  }
}

// Uso:
const dados = await safeAsync(
  () => fetchGithubData(),
  JSON.parse(localStorage.getItem('hub_cache') || '{}'),
  'Erro ao carregar dados. Usando cache.'
);
```

### 12.13. Error Boundary — Cada Painel é Isolado
O SPA tem múltiplos painéis (Visão 360, Eva, Kawa, etc.). Se UM falhar, os OUTROS devem continuar funcionando.

```js
// Cada função de render é isolada em try/catch
function safeRender(fn, nomePainel, elemento) {
  try {
    const html = fn();
    if (elemento) elemento.innerHTML = html;
    return html;
  } catch (err) {
    console.error(`❌ Painel ${nomePainel} falhou:`, err);
    if (elemento) {
      elemento.innerHTML = `
        <div class="panel-error">
          <span>⚠️</span>
          <p>Erro ao carregar <strong>${nomePainel}</strong></p>
          <button onclick="location.reload()">Tentar novamente</button>
        </div>`;
    }
    return null;
  }
}

// Uso no app.js:
safeRender(() => renderVisao360(sessao), 'Visão 360', el);
safeRender(() => renderPainelEva(sessao), 'Painel Eva', el);
safeRender(() => renderPainelKawa(sessao), 'Painel Kawa', el);
```

### 12.14. Font Loading — Evitar Flash de Texto Invisível
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```
- `&display=swap` é **obrigatório** — sem isso, o texto fica invisível enquanto a fonte carrega
- Opcional: adicionar `font-display: swap;` no CSS como fallback
- Peso: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- [ ] `token.js` no `.gitignore` — verificar antes de cada commit
- [ ] Nenhum dado sensível em logs do console
- [ ] Senha geral não aparece no código fonte (hash ou variável ofuscada)
- [ ] Input de senha tratado (sem XSS)
- [ ] Fetch apenas para `raw.githubusercontent.com` e `api.github.com`
- [ ] localStorage não contém tokens
- [ ] Links externos com `target="_blank"` e `rel="noopener"`

- [ ] Todos os 7 perfis logam corretamente
- [ ] Cada perfil vê SÓ o que deveria ver
- [ ] Mobile: todos os componentes funcionam em tela 375px
- [ ] Ordenação: atrasadas > hoje > amanhã > data
- [ ] "Ver mais" toggle funciona
- [ ] Copiar legenda funciona (clipboard API)
- [ ] Sincronização de conclusões (ler + escrever)
- [ ] Senha geral + mudar senha individual
- [ ] Filtros de publicação funcionam
- [ ] Filtro por responsável funciona
- [ ] Contagem regressiva correta
- [ ] Relógio SP atualizando
- [ ] Links externos abrem em nova aba
- [ ] Navegação por abas sem refresh
- [ ] Dados eleitorais corretos (meta 10.000)
- [ ] Emendas e finanças com valores corretos

---

## PRÓXIMOS PASSOS

1. ✅ Revisar este plano — ajustar o que faltar
2. Executar Fase 1 (Esqueleto + Login + Dados)
3. Executar Fase 2 (Componentes)
4. Executar Fase 3 (Painéis)
5. Executar Fase 4 (Conteúdo + Sync)
6. Executar Fase 5 (Polimento + Deploy)