#!/usr/bin/env python3
"""Autenticação no Google Drive + Upload de arquivos."""

import os, json, pickle, sys
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']
TOKEN_PATH = os.path.expanduser('~/.hermes/drive_token.pickle')
CREDENTIALS_PATH = os.path.expanduser('~/.hermes/drive_credentials.json')

def get_service():
    creds = None
    # Token salvo
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, 'rb') as f:
            creds = pickle.load(f)
    # Se não tem token válido, autentica
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_PATH):
                print("❌ Credenciais OAuth não encontradas.")
                print("1) Vá em: https://console.cloud.google.com/apis/credentials")
                print("2) Crie uma credencial OAuth 2.0 (Desktop App)")
                print("3) Baixe o JSON e salve como: ~/.hermes/drive_credentials.json")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES, redirect_uri='urn:ietf:wg:oauth:2.0:oob')
            print("\n🔗 LINK DE AUTORIZAÇÃO (abra no navegador):")
            print(f"   {flow.authorization_url(prompt='consent', access_type='offline')[0]}")
            print("\n📝 Depois de autorizar:")
            print("   1. O navegador vai mostrar um código (ex: 4/0AX...X)")
            print("   2. COPIE esse código inteiro")
            print("   3. COLE aqui no chat:\n")
            code = sys.stdin.readline().strip()
            if code:
                flow.fetch_token(code=code)
                creds = flow.credentials
                with open(TOKEN_PATH, 'wb') as f:
                    pickle.dump(creds, f)
                print('✅ Autenticado com sucesso!')
        with open(TOKEN_PATH, 'wb') as f:
            pickle.dump(creds, f)
    return build('drive', 'v3', credentials=creds)

def upload_ata(pasta_id):
    """Sobe a ATA da reunião de 06/08 no Google Drive."""
    service = get_service()
    file_path = os.path.expanduser('~/hub-campanha-jundiai/ata-comunicacao-0608.md')
    
    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False
    
    file_metadata = {
        'name': 'ATA - Reunião Comunicação - 06_08_2026.md',
        'parents': [pasta_id]
    }
    media = MediaFileUpload(file_path, mimetype='text/markdown', resumable=True)
    
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id, name, webViewLink'
    ).execute()
    
    print(f"✅ ATA enviada para o Drive!")
    print(f"   Nome: {file.get('name')}")
    print(f"   Link: {file.get('webViewLink')}")
    return True

def list_folder(pasta_id):
    """Lista arquivos na pasta."""
    service = get_service()
    results = service.files().list(
        q=f"'{pasta_id}' in parents and trashed=false",
        fields="files(id, name, mimeType, webViewLink)",
        orderBy="createdTime desc"
    ).execute()
    files = results.get('files', [])
    if not files:
        print("📂 Pasta vazia.")
    else:
        print(f"📂 Arquivos na pasta ({len(files)}):")
        for f in files:
            tipo = "📄" if f['mimeType'] == 'application/vnd.google-apps.document' else "📁" if 'folder' in f['mimeType'] else "📎"
            print(f"  {tipo} {f['name']}")
    return files

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python3 drive_upload.py upload <pasta_id>")
        print("      python3 drive_upload.py list <pasta_id>")
        sys.exit(1)
    
    action = sys.argv[1]
    pasta_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    if action == 'upload':
        if not pasta_id:
            print("❌ Informe o ID da pasta")
            sys.exit(1)
        upload_ata(pasta_id)
    elif action == 'list':
        list_folder(pasta_id) if pasta_id else list_folder('root')
    else:
        print(f"Ação desconhecida: {action}")