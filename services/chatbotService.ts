import { buildUrl, fetchJsonWithAuth } from '../utils/api';

export async function ask(payload: { question: string }): Promise<any> {
  const url = buildUrl('chatbot/ask');
  const response = await fetchJsonWithAuth<any>(url, {
    method: 'POST',
    body: JSON.stringify({ question: payload.question }),
  });
  return response;
}

const chatbotService = { ask };

export default chatbotService;

