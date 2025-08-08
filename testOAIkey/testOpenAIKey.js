

// testOpenAIKey.js
// Script simples para testar a API Key do OpenAI lida do .env

import 'dotenv/config';
import https from 'https';

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!apiKey) {
    console.error('FALHA: OPENAI_API_KEY não encontrada (defina no .env ou ambiente).');
    process.exit(1);
}

const payload = JSON.stringify({
    model,
    messages: [{ role: 'user', content: 'Responda apenas: ok' }],
    max_tokens: 3
});

const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'megera-keytest/1.0'
    },
    timeout: 10000
};

console.log('Testando chave OpenAI com modelo', model);
const started = Date.now();

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        const ms = Date.now() - started;
        if (res.statusCode >= 400) {
            console.error(`FALHA HTTP ${res.statusCode}:`, body);
            process.exit(2);
        }
        try {
            const json = JSON.parse(body);
            const text = json.choices?.[0]?.message?.content?.trim();
            if (!text) {
                console.error('FALHA: resposta sem conteúdo esperado:', body);
                process.exit(3);
            }
            console.log('SUCESSO em', ms + 'ms:', text);
            process.exit(0);
        } catch (e) {
            console.error('FALHA parse JSON:', e, body);
            process.exit(4);
        }
    });
});

req.on('error', (e) => {
    console.error('FALHA requisição:', e);
    process.exit(5);
});

req.on('timeout', () => {
    console.error('FALHA: timeout');
    req.destroy();
    process.exit(6);
});

req.write(payload);
req.end();
