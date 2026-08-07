#!/usr/bin/env python3
import subprocess, json, re

result = subprocess.run(['git', 'show', 'HEAD~1:index.html'], capture_output=True, text=True, cwd='/home/conta/hub-campanha-jundiai')
html = result.stdout
js_match = re.search(r'<script>(.*?)</script>', html, re.DOTALL)
js_text = js_match.group(1) if js_match else ''

def parse_producao(js_text):
    items = []
    prod_match = re.search(r'const PRODUCAO = \[(.*?)\];', js_text, re.DOTALL)
    if not prod_match: return items
    text = prod_match.group(1)
    objs = re.findall(r'\{[^}]*tarefa[^}]*\}[,\s]*', text, re.DOTALL)
    for obj in objs:
        item = {}
        t = re.search(r'tarefa:\s*"([^"]+)"', obj)
        r = re.search(r'responsavel:\s*"([^"]+)"', obj)
        p = re.search(r'prazo:\s*"([^"]+)"', obj)
        u = re.search(r'urgencia:\s*"([^"]+)"', obj)
        l = re.search(r'lote:\s*"([^"]+)"', obj)
        lk = re.search(r'legendaKey:\s*\'([^\']+)\'', obj)
        rk = re.search(r'reelsKey:\s*\'([^\']+)\'', obj)
        refs = re.findall(r'\'([^\']+)\'', obj.split('refs:')[1].split(']')[0] if 'refs:' in obj else '')
        if t: item['titulo'] = t.group(1)
        if r: item['responsavel'] = r.group(1).split(' ')[0].lower()
        if p: item['prazo'] = p.group(1)
        if u: item['urgencia'] = u.group(1)
        if l: item['lote'] = l.group(1)
        if refs: item['refs'] = refs[:3]
        if lk: item['legenda_key'] = lk.group(1)
        if rk: item['reels_key'] = rk.group(1)
        if t: items.append(item)
    return items

def parse_publicacao(js_text):
    items = []
    pub_match = re.search(r'const PUBLICACAO = \[(.*?)\];', js_text, re.DOTALL)
    if not pub_match: return items
    text = pub_match.group(1)
    objs = re.findall(r'\{[^}]*data[^}]*\}[,\s]*', text, re.DOTALL)
    for obj in objs:
        item = {}
        d = re.search(r'data:\s*"([^"]+)"', obj)
        di = re.search(r'dia:\s*"([^"]+)"', obj)
        h = re.search(r'horario:\s*"([^"]+)"', obj)
        t = re.search(r'tema:\s*"([^"]+)"', obj)
        f = re.search(r'formato:\s*"([^"]+)"', obj)
        fa = re.search(r'fase:\s*"([^"]+)"', obj)
        r = re.findall(r"'([^']+)'", obj[obj.find('responsavel'):] if 'responsavel' in obj else '')
        if d: item['data'] = d.group(1)
        if di: item['dia'] = di.group(1)
        if h: item['horario'] = h.group(1)
        if t: item['tema'] = t.group(1)
        if f: item['formato'] = f.group(1)
        if fa: item['fase'] = fa.group(1)
        if r: item['responsavel'] = [x.split(' ')[0].lower() for x in r]
        if d and t: items.append(item)
    return items

producoes = parse_producao(js_text)
publicacoes = parse_publicacao(js_text)

# Read current db.json
with open('/home/conta/hub-campanha-jundiai/data/db.json', encoding='utf-8') as f:
    db = json.load(f)

# Add production tasks
db['tarefas'] = []
for i, p in enumerate(producoes):
    db['tarefas'].append({
        'id': f'prod_{i+1:03d}',
        'titulo': p.get('titulo', ''),
        'tipo': 'producao',
        'responsavel': p.get('responsavel', ''),
        'prazo': p.get('prazo', ''),
        'urgencia': p.get('urgencia', 'normal'),
        'lote': p.get('lote', ''),
        'status': 'pendente',
        'hoh_status': 'approved' if p.get('responsavel') in ['kwa'] else 'pending',
        'legenda_key': p.get('legenda_key', ''),
        'reels_key': p.get('reels_key', '')
    })

# Add publications
db['publicacoes'] = []
for i, p in enumerate(publicacoes):
    db['publicacoes'].append({
        'id': f'pub_{i+1:03d}',
        'data': p.get('data', ''),
        'dia': p.get('dia', ''),
        'horario': p.get('horario', ''),
        'tema': p.get('tema', ''),
        'formato': p.get('formato', ''),
        'fase': p.get('fase', ''),
        'responsavel': p.get('responsavel', [])
    })

# Save
with open('/home/conta/hub-campanha-jundiai/data/db.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"✅ db.json atualizado!")
print(f"   Produção: {len(producoes)} tarefas")
print(f"   Publicação: {len(publicacoes)} posts")
print(f"   Tamanho: {len(json.dumps(db, ensure_ascii=False))} bytes")