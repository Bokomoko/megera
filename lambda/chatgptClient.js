// lambda/chatgptClient.js
// Modo simplificado: Alexa apenas repete (vocaliza) o que o usuário disser

import 'dotenv/config'; // opcional em Lambda (ignorado se não existir .env)

const DEBUG = process.env.DEBUG === '1';
function d(...args) { if (DEBUG) console.log('[DEBUG]', ...args); }

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
    try {
        d('Evento recebido:', JSON.stringify(event));
        const reqType = event?.request?.type;

        if (reqType === 'LaunchRequest') {
            return alexaResponse('Olá, eu sou a Megera. Diga algo e eu repetirei.', false);
        }

        if (reqType === 'IntentRequest') {
            const intentName = event.request.intent?.name;
            if (intentName === 'ChatGPTIntent') {
                const prompt = event.request.intent?.slots?.Prompt?.value;
                if (!prompt) return alexaResponse('Não entendi. Repita sua frase.', false);
                // Modo eco: apenas repete o que foi dito pelo usuário
                return alexaResponse(prompt, true);
            }
            if (['AMAZON.HelpIntent'].includes(intentName)) {
                return alexaResponse('Você pode dizer: repetir olá mundo.', false);
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

