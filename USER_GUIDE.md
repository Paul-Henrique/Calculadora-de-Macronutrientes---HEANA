# DietCalc - Guia do Usuário Final

Este documento descreve como instalar e utilizar o DietCalc, uma calculadora nutricional standalone.

## Instalação

### Windows
1. Localize o arquivo `DietCalc Setup 1.0.0.exe` na pasta `dist`.
2. Execute o instalador e siga as instruções na tela.
3. O aplicativo será instalado e um atalho será criado na área de trabalho.

### macOS
1. Localize o arquivo `DietCalc-1.0.0.dmg` na pasta `dist`.
2. Abra o arquivo DMG e arraste o ícone do DietCalc para a pasta `Applications`.

### Linux
1. Localize o arquivo `DietCalc-1.0.0.AppImage` na pasta `dist`.
2. Dê permissão de execução ao arquivo: `chmod +x DietCalc-1.0.0.AppImage`.
3. Execute o arquivo.

## Uso Básico

1. Ao abrir o aplicativo, o backend será iniciado automaticamente em segundo plano.
2. A interface principal exibirá a calculadora nutricional.
3. Insira seus dados (nome, idade, peso, altura, sexo e nível de atividade).
4. Clique em "Calcular" para obter sua TMB, GET e distribuição de macronutrientes.
5. Utilize as abas laterais para gerenciar refeições e visualizar o dashboard.

## Troubleshooting (Solução de Problemas)

### O aplicativo não abre ou fecha imediatamente
- Verifique se não há outra instância do backend rodando na porta 8000.
- Certifique-se de que seu antivírus não bloqueou o processo `backend.exe`.

### Erro de conexão com o servidor
- O backend pode demorar alguns segundos para iniciar na primeira execução. Aguarde um momento e tente novamente.
- Se o problema persistir, reinicie o aplicativo.

### O gráfico não aparece no PDF
- O processo de geração de PDF converte o gráfico em imagem. Certifique-se de que a página carregou completamente antes de gerar o relatório.

## Contato e Suporte
Para mais informações ou suporte técnico, entre em contato com o desenvolvedor responsável.
