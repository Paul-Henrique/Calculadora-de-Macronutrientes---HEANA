# Contribuindo para o DietCalc

## Fluxo de Trabalho
- Crie branches descritivas: `feature/`, `fix/`, `docs/`, `chore/`
- Abra Pull Requests com contexto, screenshots e passos de teste
- Mantenha PRs pequenos e focados

## Commits Semânticos
- Use Conventional Commits:
  - `feat(scope): descrição`
  - `fix(scope): descrição`
  - `docs(scope): descrição`
  - `chore(scope): descrição`
  - `refactor(scope): descrição`
  - `test(scope): descrição`

## Padrões de Código
- Frontend: React + TypeScript, seguir ESLint e Hooks
- Backend: FastAPI + SQLAlchemy, seguir Pydantic e separação de camadas
- Variáveis sensíveis apenas em `.env`; documentar em `.env.example`

## Testes
- Backend: `pytest`
- Frontend: sugerido `vitest` + `@testing-library/react`

## Releases
- Versão semântica (`vMAJOR.MINOR.PATCH`)
- Atualize `CHANGELOG.md` em cada release
