#!/usr/bin/env python3
"""Exchange OAuth code for a Drive token. Usage: python3 exchange_code.py <CODE>"""
import sys, pickle, json
from google_auth_oauthlib.flow import InstalledAppFlow

if len(sys.argv) < 2:
    # Generate URL mode
    flow = InstalledAppFlow.from_client_secrets_file(
        '/home/conta/.hermes/drive_credentials.json',
        ['https://www.googleapis.com/auth/drive.file'],
        redirect_uri='urn:ietf:wg:oauth:2.0:oob'
    )
    url, _ = flow.authorization_url(prompt='consent', access_type='offline')
    print(url)
    sys.exit(0)

# Exchange mode
code = sys.argv[1]
flow = InstalledAppFlow.from_client_secrets_file(
    '/home/conta/.hermes/drive_credentials.json',
    ['https://www.googleapis.com/auth/drive.file'],
    redirect_uri='urn:ietf:wg:oauth:2.0:oob'
)
flow.fetch_token(code=code)
creds = flow.credentials
with open('/home/conta/.hermes/drive_token.pickle', 'wb') as f:
    pickle.dump(creds, f)
print('TOKEN_OK')