# ArenaEvo Frontend

Frontend multi-organização em React, TypeScript e Vite.

## Comandos

```bash
npm install
npm run dev
npm run build
```

O slug da URL identifica a organização. Exemplo: `/bxct` resolve `ORG_0001`. A configuração visual do BX CT fica em `org/ORG_0001`, e os arquivos públicos compartilhados por organizações ficam em `org/public`.

Em produção, a API padrão é `https://arenaevo-backend.onrender.com`. Ela pode ser substituída por `VITE_API_URL` no provedor do frontend.

## Firebase

A configuração Web do Firebase é pública por definição e está disponível como fallback em `src/lib/firebase.ts`. Segurança real é aplicada por Firebase Auth, custom claims e pelas regras do Firestore, mantidas na raiz do projeto ArenaEvo.

