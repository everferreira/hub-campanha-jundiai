#!/usr/bin/env python3
"""Etapa 1: Gera URL e salva estado do flow"""
import pickle, json
from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_secrets_file(
    '/home/conta/.hermes/drive_credentials.json',
    ['https://www.googleapis.com/auth/drive.file'],
    redirect_uri='urn:ietf:wg:oauth:2.0:oob'
)
url, _ = flow.authorization_url(prompt='consent', access_type='offline')

# Salva só o code_verifier (não dá pra picklear o flow inteiro)
import json
state_data = {
    'code_verifier': flow.code_verifier,
    'client_config': flow.client_config,
    'redirect_uri': flow.redirect_uri,
}
with open('/home/conta/.hermes/drive_flow_state.json', 'w') as f:
    json.dump(state_data, f)

print(url)