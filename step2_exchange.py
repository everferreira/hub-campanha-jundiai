#!/usr/bin/env python3
"""Etapa 2: Troca código por token usando o code_verifier salvo. Uso: python3 step2_exchange.py <CODIGO>"""
import sys, json, pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from oauthlib.oauth2 import WebApplicationClient

flow_path = '/home/conta/.hermes/drive_flow_state.json'
if len(sys.argv) < 2:
    print("Uso: python3 step2_exchange.py <CODIGO>")
    sys.exit(1)

with open(flow_path) as f:
    state = json.load(f)

code = sys.argv[1]

# Recria o flow e define o code_verifier manualmente
flow = InstalledAppFlow.from_client_secrets_file(
    '/home/conta/.hermes/drive_credentials.json',
    ['https://www.googleapis.com/auth/drive.file'],
    redirect_uri=state['redirect_uri']
)
flow.code_verifier = state['code_verifier']
flow.fetch_token(code=code)
creds = flow.credentials
with open('/home/conta/.hermes/drive_token.pickle', 'wb') as f:
    pickle.dump(creds, f)
print('TOKEN_OK')