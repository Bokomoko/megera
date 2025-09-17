# Guia de Instalação e Deploy da Skill Megera

Este guia fornece instruções detalhadas para fazer o deploy completo da skill Alexa Megera, desde a configuração inicial até os testes finais.

## Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Conta na Amazon Developer Console
- [ ] Conta AWS (Amazon Web Services)
- [ ] Conta OpenAI com API Key válida
- [ ] Node.js versão 18+ instalado
- [ ] AWS CLI configurado (com credenciais em `~/.aws/credentials`)
- [ ] Dispositivo Alexa ou app Alexa para testes

## Parte 1: Configuração da API OpenAI

### 1.1 Obter API Key da OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com/signup)
2. Faça login ou crie uma conta
3. Navegue até "API Keys" no menu lateral
4. Clique em "Create new secret key"
5. Copie e guarde a chave em local seguro

### 1.2 Configurar variáveis de ambiente

1. No diretório `lambda/`, crie um arquivo `.env`:

```bash
OPENAI_API_KEY=sua-chave-openai-aqui
```

## Parte 2: Deploy do Backend (AWS Lambda)

### 2.1 Preparar o código Lambda

1. Navegue até o diretório lambda:

```bash
cd lambda/
```

2. Instale as dependências:

```bash
npm install
```

3. Teste localmente (opcional):

```bash
node chatgptClient.js
```

### 2.2 Criar função Lambda na AWS

**Opção A: Via AWS Console**

1. Acesse o console AWS Lambda
2. Clique em "Create function"
3. Escolha "Author from scratch"
4. Configure:
   - **Function name**: `megera-chatgpt`
   - **Runtime**: Node.js 18.x
   - **Architecture**: x86_64

**Opção B: Via AWS CLI**
> Dica: se você usa múltiplas contas/perfis AWS, exporte `AWS_PROFILE` antes dos comandos abaixo para usar as credenciais do arquivo `~/.aws/credentials`.
>
> Exemplo: `export AWS_PROFILE=meu-perfil`

1. Primeiro, crie um arquivo de política para a função (trust policy):

```bash
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
```

2. Crie uma role IAM para a função Lambda:

```bash
aws iam create-role --role-name megera-lambda-role --assume-role-policy-document file://trust-policy.json ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

3. Anexe a política básica de execução do Lambda:

```bash
aws iam attach-role-policy --role-name megera-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

4. Crie o arquivo ZIP com o código (certifique-se de estar no diretório `lambda/`):

```bash
cd lambda/
zip -r ../megera-lambda.zip . -x "node_modules/*"
cd ..
```

5. Crie a função Lambda:

```bash
aws lambda create-function \
    --function-name megera-chatgpt \
    --runtime nodejs18.x \
  --role arn:aws:iam::$(aws sts get-caller-identity ${AWS_PROFILE:+--profile ${AWS_PROFILE}} --query Account --output text):role/megera-lambda-role \
    --handler chatgptClient.handler \
    --zip-file fileb://megera-lambda.zip \
    --timeout 30 \
  --memory-size 256 ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

6. Configure as variáveis de ambiente:

```bash
aws lambda update-function-configuration \
    --function-name megera-chatgpt \
  --environment Variables='{OPENAI_API_KEY=sua-chave-openai-aqui}' ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

7. Adicione permissão para Alexa Skills Kit:

```bash
aws lambda add-permission \
    --function-name megera-chatgpt \
    --statement-id alexa-skill-trigger \
    --action lambda:InvokeFunction \
  --principal alexa-appkit.amazon.com ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

### 2.3 Fazer upload do código

**Opção A: Via AWS Console**

1. Comprima todos os arquivos do diretório `lambda/`:

```bash
zip -r megera-lambda.zip . -x "node_modules/*"
```

2. No console Lambda, vá em "Code" > "Upload from" > ".zip file"
3. Faça upload do arquivo `megera-lambda.zip`

**Opção B: Via AWS CLI**

```bash
npm run deploy
```

**Opção C: Deploy completo via CLI (se a função ainda não existe)**

```bash
# Prepare o código
cd lambda/
npm install
zip -r ../megera-lambda.zip . -x "node_modules/*"
cd ..

# Crie a função (se não existe)
aws lambda create-function \
    --function-name megera-chatgpt \
    --runtime nodejs18.x \
  --role arn:aws:iam::$(aws sts get-caller-identity ${AWS_PROFILE:+--profile ${AWS_PROFILE}} --query Account --output text):role/megera-lambda-role \
    --handler chatgptClient.handler \
    --zip-file fileb://megera-lambda.zip \
    --timeout 30 \
    --memory-size 256 \
  --environment Variables='{OPENAI_API_KEY=sua-chave-openai-aqui}' ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

**Opção D: Atualizar função existente via CLI**

```bash
# Apenas atualizar o código
aws lambda update-function-code \
    --function-name megera-chatgpt \
  --zip-file fileb://megera-lambda.zip ${AWS_PROFILE:+--profile ${AWS_PROFILE}}

# Atualizar configuração se necessário
aws lambda update-function-configuration \
    --function-name megera-chatgpt \
    --timeout 30 \
  --memory-size 256 ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

### 2.4 Configurar variáveis de ambiente

1. No console Lambda, vá em "Configuration" > "Environment variables"
2. Adicione:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: sua chave da OpenAI

### 2.5 Configurar timeout e memória

1. Em "Configuration" > "General configuration":
   - **Timeout**: 30 segundos
   - **Memory**: 256 MB

### 2.6 Configurar trigger da Alexa

1. Em "Function overview", clique em "Add trigger"
2. Selecione "Alexa Skills Kit"
3. **Skill ID verification**: Disable (por enquanto)
4. Clique em "Add"

### 2.7 Copiar ARN da função

1. Copie o ARN da função Lambda (algo como: `arn:aws:lambda:us-east-1:123456789012:function:megera-chatgpt`)
2. Guarde este ARN - será necessário na configuração da skill

## Parte 3: Criar a Skill Alexa

### 3.1 Acessar Amazon Developer Console

1. Acesse [developer.amazon.com](https://developer.amazon.com/alexa/console/ask)
2. Faça login com sua conta Amazon
3. Clique em "Create Skill"

### 3.2 Configurar informações básicas

1. **Skill name**: Megera
2. **Primary locale**: Portuguese (BR) - pt-BR
3. **Model**: Custom
4. **Method**: Alexa-hosted (Node.js) ou Provision your own
5. Clique em "Create skill"

### 3.3 Configurar Invocation

1. No painel esquerdo, clique em "Invocation"
2. **Skill Invocation Name**: `megera`
3. Clique em "Save Model"

### 3.4 Criar Intent personalizado

1. Clique em "Intents" > "Add Intent"
2. **Intent Name**: `ChatGPTIntent`
3. Adicione Sample Utterances:
   - `{Prompt}`
   - `pergunta {Prompt}`
   - `diga {Prompt}`
   - `responda {Prompt}`

### 3.5 Configurar Slot

1. Na intent `ChatGPTIntent`, adicione um slot:
   - **Slot Name**: `Prompt`
   - **Slot Type**: `AMAZON.SearchQuery`
2. Marque como "Required"

### 3.6 Configurar Built-in Intents

Certifique-se de que estes intents estão configurados:

- `AMAZON.CancelIntent`
- `AMAZON.HelpIntent`
- `AMAZON.StopIntent`

### 3.7 Build do modelo

1. Clique em "Save Model"
2. Clique em "Build Model"
3. Aguarde o build completar

## Parte 4: Configurar Endpoint

### 4.1 Configurar AWS Lambda ARN

1. Clique em "Endpoint" no painel esquerdo
2. Selecione "AWS Lambda ARN"
3. **Default Region**: Cole o ARN da função Lambda
4. Clique em "Save Endpoints"

### 4.2 Atualizar Lambda com Skill ID

1. Volte ao console AWS Lambda
2. No trigger Alexa Skills Kit, edite e adicione o Skill ID
3. **Skill ID**: Encontre no Developer Console > "View Skill ID"

## Parte 5: Testar a Skill

### 5.1 Teste no simulador

1. No Developer Console, clique em "Test"
2. Ative o teste para "Development"
3. Digite ou fale: "abrir megera"
4. Teste com perguntas como: "qual a capital do Brasil?"

### 5.2 Teste em dispositivo real

1. Certifique-se de que sua conta Alexa está vinculada à mesma conta Amazon Developer
2. Diga: "Alexa, abrir megera"
3. Faça perguntas para testar a integração com ChatGPT

## Parte 6: Publicação (Opcional)

### 6.1 Configurar informações da skill

1. Clique em "Distribution"
2. Preencha:
   - **Public Name**: Megera
   - **One Sentence Description**: Gateway para ChatGPT via Alexa
   - **Detailed Description**: Descrição completa da skill
   - **Example Phrases**: Exemplos de uso
   - **Small Icon**: 108x108px
   - **Large Icon**: 512x512px

### 6.2 Configurar Privacy & Compliance

1. Preencha as informações de privacidade
2. Indique se a skill é adequada para crianças
3. Configure termos de uso e política de privacidade

### 6.3 Submeter para certificação

1. Clique em "Validation"
2. Execute os testes de validação
3. Clique em "Submission" para enviar para análise

## Troubleshooting

### Problemas comuns

**Lambda timeout**

- Aumente o timeout para 30 segundos
- Verifique se a API da OpenAI está respondendo

**Skill não responde**

- Verifique se o ARN está correto
- Confirme se as variáveis de ambiente estão configuradas
- Verifique logs no CloudWatch

**Erro de API OpenAI**

- Verifique se a API Key está válida
- Confirme se há créditos disponíveis na conta OpenAI
- Verifique rate limits

**Intent não reconhecido**

- Rebuild o modelo de interação
- Verifique se os sample utterances estão corretos
- Teste diferentes formas de falar

## Monitoramento

### CloudWatch Logs

- Acesse CloudWatch > Log Groups
- Procure por `/aws/lambda/megera-chatgpt`
- Monitore logs de erro e performance

### Métricas Alexa

- No Developer Console, acesse "Analytics"
- Monitore usage, sessões e erros

## Manutenção

### Comandos úteis AWS CLI para Lambda

**Listar todas as funções:**

```bash
aws lambda list-functions --query 'Functions[].FunctionName' --output table ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

**Verificar informações da função:**

```bash
aws lambda get-function --function-name megera-chatgpt ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

**Ver logs da função:**

```bash
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/megera-chatgpt" ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
aws logs tail "/aws/lambda/megera-chatgpt" --follow ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

**Invocar função para teste:**

```bash
aws lambda invoke \
    --function-name megera-chatgpt \
    --payload '{"version":"1.0","session":{"new":true},"request":{"type":"IntentRequest","intent":{"name":"ChatGPTIntent","slots":{"Prompt":{"value":"teste"}}}}}' \
  response.json ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

**Deletar função:**

```bash
aws lambda delete-function --function-name megera-chatgpt ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

**Verificar variáveis de ambiente:**

```bash
aws lambda get-function-configuration --function-name megera-chatgpt --query 'Environment' ${AWS_PROFILE:+--profile ${AWS_PROFILE}}
```

### Atualizações de código

1. Modifique o código no diretório `lambda/`
2. Execute `npm run deploy` ou faça upload manual
3. Teste a skill após a atualização

### Atualização do modelo de interação

1. Modifique intents ou utterances no Developer Console
2. Clique em "Save Model" > "Build Model"
3. Teste as mudanças

---

## Recursos Adicionais

- [Documentação oficial Alexa Skills](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

**Desenvolvido por João Eurico**
