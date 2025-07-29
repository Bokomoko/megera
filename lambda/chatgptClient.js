// lambda/chatgptClient.js
// Handler para Alexa Skill integrando com ChatGPT (OpenAI)


const https = require('https');
// Node 22+ já carrega variáveis do .env automaticamente se o arquivo existir
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_HOST = 'api.openai.com';
const OPENAI_API_PATH = '/v1/chat/completions';

function callChatGPT(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200
        });

        const options = {
            hostname: OPENAI_API_HOST,
            path: OPENAI_API_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    const answer = json.choices[0].message.content.trim();
                    resolve(answer);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

exports.handler = async (event, context) => {
    const prompt = event.request.intent.slots.Prompt.value;
    try {
        const gptResponse = await callChatGPT(prompt);
        return {
            version: '1.0',
            response: {
                outputSpeech: {
                    type: 'PlainText',
                    text: gptResponse
                },
                shouldEndSession: true
            }
        };
    } catch (err) {
        return {
            version: '1.0',
            response: {
                outputSpeech: {
                    type: 'PlainText',
                    text: 'Desculpe, houve um erro ao acessar o ChatGPT.'
                },
                shouldEndSession: true
            }
        };
    }
};
