// lambda/chatgptClient.js
// Handler Alexa Skill -> OpenAI Chat Completions (robustecido)

import 'dotenv/config'; // opcional em Lambda (ignorado se não existir .env)
import https from 'https';

const OPENAI_API_HOST = 'api.openai.com';
const OPENAI_API_PATH = '/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // modelo mais atual/leve
const DEBUG = process.env.DEBUG === '1';

function d(...args) { if (DEBUG) console.log('[DEBUG]', ...args); }

function buildOpenAIRequestBody(prompt) {
    return JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
    });
}

function parseOpenAIResponse(body) {
    let json;
    try { json = JSON.parse(body); } catch (e) { throw new Error('Resposta inválida da OpenAI (JSON malformado)'); }
    if (!json.choices?.length || !json.choices[0].message?.content) {
        throw new Error('Estrutura inesperada da resposta da OpenAI');
    }
    return json.choices[0].message.content.trim();
}

function callChatGPT(prompt, apiKey) {
    return new Promise((resolve, reject) => {
        const data = buildOpenAIRequestBody(prompt);
        const options = {
            hostname: OPENAI_API_HOST,
            path: OPENAI_API_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(data),
                'User-Agent': 'megera-skill/1.0'
            },
            timeout: 15000
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                d('OpenAI status', res.statusCode);
                if (res.statusCode >= 400) {
                    return reject(new Error(`OpenAI HTTP ${res.statusCode}: ${body}`));
                }
                try { resolve(parseOpenAIResponse(body)); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(new Error('Timeout na requisição OpenAI')); });
        req.write(data);
        req.end();
    });
}

function alexaResponse(text, end = false) {
    return {
        version: '1.0',
        response: {
            outputSpeech: { type: 'PlainText', text },
            shouldEndSession: end
        }
    };
}

export async function handler(event) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OPENAI_API_KEY ausente');
        return alexaResponse('Configuração inválida: chave da OpenAI ausente.', true);
    }

    try {
        d('Evento recebido:', JSON.stringify(event));
        const reqType = event?.request?.type;

        if (reqType === 'LaunchRequest') {
            return alexaResponse('Olá, eu sou a Megera. O que você quer saber?', false);
        }

        if (reqType === 'IntentRequest') {
            const intentName = event.request.intent?.name;
            if (intentName === 'ChatGPTIntent') {
                const prompt = event.request.intent?.slots?.Prompt?.value;
                if (!prompt) return alexaResponse('Não entendi. Repita sua pergunta.', false);
                const answer = await callChatGPT(prompt, apiKey);
                return alexaResponse(answer, true);
            }
            if (['AMAZON.HelpIntent'].includes(intentName)) {
                return alexaResponse('Você pode perguntar algo dizendo: qual é a capital da França?', false);
            }
            if (['AMAZON.CancelIntent', 'AMAZON.StopIntent'].includes(intentName)) {
                return alexaResponse('Até logo.', true);
            }
            return alexaResponse('Desculpe, não reconheço esse pedido.', false);
        }

        if (reqType === 'SessionEndedRequest') {
            return alexaResponse('Sessão encerrada.', true);
        }

        return alexaResponse('Tipo de requisição não suportado.', true);
    } catch (err) {
        console.error('Erro no handler:', err);
        return alexaResponse('Desculpe, ocorreu um erro ao processar sua solicitação.', true);
    }
}

