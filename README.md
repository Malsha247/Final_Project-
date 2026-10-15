# Final_Project-

## Wasantha Eco Husk Solutions

The complete React frontend, PHP API, and Docker Compose configuration are included here.

- `wasantha-eco-husk-solutions/`: React frontend
- `wasanthaecohusksolution/backend/`: PHP API
- `compose.yaml`: React, PHP, and MySQL services

### Local setup

1. Copy `.env.example` to `.env` and configure strong database passwords.
2. Copy `.env.services.example` to `.env.services.local` and configure the email, payment, and chatbot services you use. SMTP variable names identify the endpoint using them. Leave `BOOTSTRAP_ADMIN_PASSWORD` unset unless intentionally using the existing admin setup utility.
3. An existing compatible `coconut_project` database is required for products and accounts. A new volume starts empty. Customer records, database dumps, schema import, and account seeding are not included.
4. Run `docker compose up -d --build`.
5. Open http://localhost:3000. The API is at http://localhost:8081/api/.

Compose supplies optional service credentials from `.env.services.local` to PHP. Outside Docker, configure the same variables in the server environment; PHP does not automatically read dotenv files.

### Checks

```sh
docker compose exec -T -e CI=true frontend npm test -- --watchAll=false --runInBand --runTestsByPath src/pages/Login.test.js
docker compose exec -T frontend npm run build
```

Secrets, SQL dumps, dependencies, logs, and local Git backups are excluded from Git. Existing MySQL volumes are preserved independently of this repository. Do not delete volumes to resolve application errors.
