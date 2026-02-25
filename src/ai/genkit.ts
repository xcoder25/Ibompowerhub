import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Using a model that is supported by the current Genkit v1beta API
  model: 'googleai/gemini-2.5-flash',
});

// Agent Communication Bus
export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'broadcast' | 'alert';
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

export class AgentCommunicationBus {
  private agents: Map<string, (message: AgentMessage) => Promise<any>> = new Map();

  registerAgent(name: string, handler: (message: AgentMessage) => Promise<any>) {
    this.agents.set(name, handler);
  }

  async sendMessage(message: AgentMessage): Promise<any> {
    const handler = this.agents.get(message.to);
    if (!handler) {
      throw new Error(`Agent ${message.to} not found`);
    }
    return await handler(message);
  }

  async broadcastMessage(from: string, type: string, payload: any): Promise<any[]> {
    const promises = Array.from(this.agents.entries())
      .filter(([name]) => name !== from)
      .map(async ([name, handler]) => {
        try {
          return await handler({
            from,
            to: name,
            type: type as any,
            payload,
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`Failed to send message to ${name}:`, error);
          return null;
        }
      });

    return Promise.all(promises);
  }
}

export const agentBus = new AgentCommunicationBus();
