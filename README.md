# Megera Alexa Skill

Megera é um aplicativo (Skill) para Amazon Alexa que serve como um gateway para o ChatGPT. Com ele, você pode conversar com a Alexa e ter suas perguntas e comandos enviados diretamente para o ChatGPT, recebendo respostas inteligentes e naturais.

## Como funciona

1. **Ativação:**
   - Diga: "Alexa, megera".
2. **Interação:**
   - Após a ativação, tudo o que você disser será enviado como prompt para o ChatGPT.
3. **Resposta:**
   - A resposta do ChatGPT será capturada e convertida em resposta verbal pela Alexa.

## Exemplo de uso

- Você: "Alexa, megera, qual a capital da Austrália?"
- Alexa (via ChatGPT): "A capital da Austrália é Canberra."

## Funcionalidades
- Integração direta com o ChatGPT.
- Respostas naturais e contextuais.
- Fácil ativação por voz.

## Requisitos
- Conta Amazon com Alexa configurada.
- Conta e API Key do OpenAI (ChatGPT).

## Instalação e Configuração
1. Faça o deploy da skill Megera na sua conta Alexa Developer.
2. Configure as credenciais da API do ChatGPT no backend da skill.
3. Habilite a skill "Megera" na sua Alexa.

## Estrutura do Projeto
- `lambda/` — Código backend da skill (Node.js ou Python).
- `models/` — Modelos de interação de voz (JSON).
- `README.md` — Este arquivo.

## Licença
MIT

---

Desenvolvido por [João Eurico].
