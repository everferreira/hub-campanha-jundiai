#!/bin/bash
# Gera o arquivo token.js com o token do GitHub para sincronização de conclusões
# Execute UMA VEZ: bash setup-token.sh
# O arquivo token.js é gitignorado (não vai pro GitHub público)

TOKEN=$(gh auth token 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "❌ gh CLI não autenticado. Rode 'gh auth login' primeiro."
  exit 1
fi

cat > token.js << EOF
// ⚠️ ATENÇÃO: Este arquivo contém um token do GitHub com acesso ao repositório.
// NÃO compartilhe este arquivo. Ele está no .gitignore e não sobe pro GitHub.
// Gerado automaticamente em $(date '+%d/%m/%Y %H:%M')
const GITHUB_TOKEN = '${TOKEN}';
EOF

echo "✅ token.js criado com sucesso!"
echo "   O hub agora pode sincronizar conclusões via GitHub API."