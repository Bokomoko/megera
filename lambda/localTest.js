// localTest.js - simula um evento Alexa para testar o handler em modo eco
import { handler } from './chatgptClient.js';

const event = {
    version: '1.0',
    request: {
        type: 'IntentRequest',
        intent: {
            name: 'ChatGPTIntent',
            slots: {
                Prompt: { name: 'Prompt', value: 'olá mundo' }
            }
        }
    }
};

const run = async () => {
    const res = await handler(event);
    console.log(JSON.stringify(res, null, 2));
};

run();
