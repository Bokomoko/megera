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

Para instruções detalhadas de instalação e deploy, consulte o **[Guia de Instalação Completo](skill_install_guide.md)**.

### Resumo dos passos:
1. Configure sua API Key da OpenAI
2. Faça o deploy da função Lambda na AWS
3. Crie e configure a skill no Amazon Developer Console
4. Configure o endpoint e teste a integração

## Estrutura do Projeto
- `lambda/` — Código backend da skill (Node.js ou Python).
- `models/` — Modelos de interação de voz (JSON).
- `README.md` — Este arquivo.

## Licença
MIT

---

Desenvolvido por [João Eurico].
