# Investigação Técnica: Erro ao Salvar Perfil (DietCalc)

## 1. Descrição do Problema
O sistema apresentava a mensagem "erro ao salvar o perfil" ao clicar no botão **"Salvar como minha meta"** na aba da Calculadora. Além disso, o comportamento esperado de navegar para a aba de refeições após o sucesso não estava ocorrendo (o sistema navegava para o Dashboard).

## 2. Causa Raiz Identificada
Foram identificadas três causas principais:
1.  **Incompatibilidade de Tipos (Frontend vs Backend)**: O Zod schema no frontend estava enviando strings vazias `""` para campos numéricos opcionais (como circunferências e exames). O Pydantic no backend esperava `float` ou `None`, e a string vazia causava um erro de validação 422.
2.  **Endpoint Inconsistente**: A chamada de API estava sendo feita para `/profile` (sem barra), enquanto o roteador FastAPI estava configurado para `/profile/`.
3.  **Tratamento de Erros Genérico**: O frontend exibia um `alert` genérico sem detalhar a falha, dificultando o diagnóstico para o usuário.

## 3. Correções Implementadas

### Frontend
- **Validação com Pre-processamento ([Calculator.tsx](file:///c:/Users/paulo.santos/Documents/trae_projects/DietCalc/frontend/src/pages/Calculator.tsx))**:
  - Implementado `z.preprocess` no schema Zod para converter strings vazias em `undefined`. Isso garante que o Axios remova o campo ou envie `null`, satisfazendo a validação do backend.
- **Fluxo de Navegação ([Calculator.tsx](file:///c:/Users/paulo.santos/Documents/trae_projects/DietCalc/frontend/src/pages/Calculator.tsx))**:
  - Alterada a rota de destino após o salvamento de `/dashboard` para `/refeicoes`, conforme solicitado.
- **Robustez na API ([api.ts](file:///c:/Users/paulo.santos/Documents/trae_projects/DietCalc/frontend/src/services/api.ts))**:
  - Adicionado interceptor de resposta com log detalhado de erros 422 (validação).
  - Corrigido o endpoint de `/profile` para `/profile/`.
  - Implementado `try-catch` em `saveProfile` para capturar e formatar mensagens de erro da API.

### Backend
- **Logging de Debug ([profile.py](file:///c:/Users/paulo.santos/Documents/trae_projects/DietCalc/backend/app/routers/profile.py))**:
  - Adicionados logs de entrada (`[DEBUG]`) e saída de erro (`[ERROR]`) para monitorar as tentativas de persistência no banco de dados SQLite.
  - Implementado bloco `try-except` para capturar exceções do SQLAlchemy e retornar um erro 500 descritivo.

## 4. Testes Executados
1.  **Sucesso**: Cadastro de perfil completo com todos os campos antropométricos e de anamnese.
2.  **Dados Parciais**: Cadastro apenas com dados obrigatórios (Peso/Altura/Idade), deixando circunferências vazias.
3.  **Navegação**: Verificado que o sistema redireciona para a aba de Refeições imediatamente após o sucesso.
4.  **Resiliência**: Simulação de queda do backend (timeout de 10s e retry mechanism validados).

## 5. Guidelines para Prevenção
- Sempre utilize `z.preprocess` ou `z.coerce` com tratamento de string vazia para campos numéricos opcionais em formulários React.
- Mantenha a consistência de barras finais (`/`) entre o frontend e as rotas do FastAPI.
- Verifique os logs do console (`[API 422] Validation Details`) para identificar campos específicos que falharam na validação do Pydantic.
