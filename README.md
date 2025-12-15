# DietCalc — Calculadora e Planejamento Nutricional

DietCalc é uma aplicação web completa para cálculo nutricional (TMB/GET), registro de refeições e acompanhamento via dashboard, utilizando a Tabela TACO como base de dados.

## Objetivos
- Calcular necessidades energéticas diárias com precisão.
- Planejar e registrar refeições com macros calculadas automaticamente.
- Acompanhar metas vs. consumo em gráficos e relatórios exportáveis (CSV/PDF).

## Requisitos do Sistema
- `Python >= 3.10` (recomendado 3.11)
- `Node.js >= 18`
- Banco de dados: SQLite (dev) ou PostgreSQL (prod)

## Instalação e Configuração

### 1) Backend
- Instalar dependências:
  ```bash
  pip install -r backend/requirements.txt
  ```
- Configurar variáveis de ambiente:
  - Criar um arquivo `.env` na raiz baseado em `.env.example`
  - Opcional (PostgreSQL): `DATABASE_URL=postgresql://usuario:senha@host:5432/banco`
  - Sem `DATABASE_URL`, o backend usa SQLite automaticamente em `backend/data/dietcalc.db`
- Popular base TACO (opcional, para dev):
  ```bash
  python backend/import_taco.py
  python backend/seed_measures.py
  ```
- Executar servidor:
  ```bash
  uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
  ```

### 2) Frontend
- Instalar dependências:
  ```bash
  cd frontend
  npm install
  ```
- Executar modo desenvolvimento:
  ```bash
  npm run dev
  ```

## Guia de Uso Básico
- Acesse `http://localhost:5173` (ou porta alternativa) para abrir o aplicativo.
- Calcule sua TMB/GET em `Calculadora` e salve o perfil.
- Registre alimentos e refeições em `Alimentos` e `Refeições`.
- Acompanhe metas vs. consumo em `Dashboard`.
- Exporte dados em `CSV` e gere relatório em `PDF` pelo `Dashboard`.

## Estrutura de Arquivos
- `backend/`: API FastAPI, modelos SQLAlchemy, rotas e scripts
- `frontend/`: Aplicação React + TypeScript (pages, components, services)
- `supabase/`: migrações SQL para Postgres
- `ARCHITECTURE.md`: visão técnica do sistema
- `.env.example`: variáveis de ambiente necessárias (sem valores)
- `.gitignore`: exclusões de repositório (node_modules, __pycache__, .env, db, etc.)

## Dependências
- Backend (principais): FastAPI, Uvicorn, SQLAlchemy, Pydantic, Pandas, python-dotenv
- Frontend (principais): React, TypeScript, TailwindCSS, Recharts, React Router, React Hook Form

## Padrões de Versionamento e Commits
- Commits semânticos (Conventional Commits):
  - `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
  - Ex.: `fix(dashboard): renderizar gráfico de macros no PDF`
- Tags semânticas: `vMAJOR.MINOR.PATCH` (ex.: `v1.0.0`)

## Segurança e Ambiente
- Nunca versionar `.env` ou credenciais; usar `.env.example`.
- Em produção, preferir PostgreSQL com `DATABASE_URL` seguro.
- CORS liberado apenas em desenvolvimento.

## Testes
- Backend: `pytest` com `TestClient` (ex.: `backend/tests/test_nutrition.py`)
- Frontend: testes podem ser adicionados com `vitest`/`@testing-library/react` (sugestão futura)

## Roadmap
- Autenticação multiusuário
- Histórico e evolução de métricas
- Exportação avançada de relatórios
