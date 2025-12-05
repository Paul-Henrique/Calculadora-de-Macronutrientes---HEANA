# Calculadora de Macronutrientes — HEANA (DietCalc)

Projeto para uma demanda do hospital para fazer cálculos de nutrientes para os pacientes, com uma implementação completa (DietCalc) de frontend e backend para cálculo, planejamento e acompanhamento nutricional.

## Visão Geral
DietCalc é uma aplicação web completa para planejamento nutricional, utilizando a Tabela TACO como base de dados. O sistema permite calcular necessidades calóricas (TMB/GET), montar refeições e acompanhar o progresso via dashboard.

## Tecnologias Utilizadas
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite (Dev) / PostgreSQL (Prod).
- **Frontend**: React, TypeScript, TailwindCSS, Recharts, React Hook Form.
- **Infraestrutura**: Docker ready, Supabase compatible.

## Funcionalidades Principais
1. **Consulta de Alimentos**: Base TACO importada e pesquisável.
2. **Calculadora Nutricional**: Fórmula Mifflin-St Jeor para TMB e GET.
3. **Planejador de Refeições**: Criação de dietas com contagem automática de macros.
4. **Medidas Caseiras**: Conversão automática (ex: "1 Colher de sopa" = 25g).
5. **Dashboard**: Comparativo visual entre Metas e Consumo.

## Configuração e Instalação

### Pré-requisitos
- Python 3.9+
- Node.js 16+

### Backend
1. Instale as dependências:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Inicialize o banco de dados (SQLite):
   ```bash
   python backend/import_taco.py
   python backend/seed_measures.py
   ```
3. Rode o servidor:
   ```bash
   uvicorn backend.app.main:app --reload
   ```

### Frontend
1. Instale as dependências:
   ```bash
   cd frontend
   npm install
   ```
2. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Estrutura do Banco de Dados (Supabase/PostgreSQL)
O esquema do banco de dados está disponível em `supabase/migrations/20240522000000_init_schema.sql`.

### Tabelas Principais:
- `foods`: Tabela nutricional (TACO).
- `user_profiles`: Metas do usuário.
- `meals` / `meal_items`: Registro de dieta.
- `household_measures`: Conversão de unidades.

## Próximos Passos (Roadmap)
- [ ] Autenticação Multi-usuário (JWT/Supabase Auth).
- [ ] Histórico de peso e evolução.
- [ ] Geração de PDF da dieta.
