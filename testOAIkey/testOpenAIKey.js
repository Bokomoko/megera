

// testOpenAIKey.js
// Script simples para testar a API Key do OpenAI lida do .env

import 'dotenv/config';
import https from 'https';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error('OPENAI_API_KEY não encontrada no .env');
    process.exit(1);
}

const data = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Diga apenas "ok".' }],
    max_tokens: 5
});

const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            console.log('Resposta da API:', json.choices[0].message.content);
        } catch (e) {
            console.error('Erro ao processar resposta:', e, body);
        }
    });
});

req.on('error', (e) => {
    console.error('Erro na requisição:', e);
});

req.write(data);
req.end();
