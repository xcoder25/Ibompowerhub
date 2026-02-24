'use server';

/**
 * @fileOverview Health Agent - Handles medical services and communicates with other agents
 */

import { ai, agentBus, AgentMessage } from '../genkit';
import { z } from 'genkit';

const HealthAgentInputSchema = z.object({
  action: z.enum(['find-hospital', 'book-appointment', 'disease-alert', 'vaccination-drive', 'emergency-response']),
  location: z.string().optional(),
  patientInfo: z.object({
    symptoms: z.string().optional(),
    urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  }).optional(),
});

export type HealthAgentInput = z.infer<typeof HealthAgentInputSchema>;

const HealthAgentOutputSchema = z.object({
  response: z.string(),
  actions: z.array(z.string()),
  coordination: z.array(z.object({
    agent: z.string(),
    message: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical'])
  })).optional(),
});

export type HealthAgentOutput = z.infer<typeof HealthAgentOutputSchema>;

export async function processHealthRequest(input: HealthAgentInput): Promise<HealthAgentOutput> {
  return healthAgentFlow(input);
}

// Register health agent with communication bus
agentBus.registerAgent('health-agent', async (message: AgentMessage) => {
  switch (message.type) {
    case 'request':
      return await processHealthRequest(message.payload);
    case 'alert':
      // Handle disease outbreaks, vaccination campaigns, etc.
      if (message.payload.diseaseOutbreak) {
        // Coordinate with agriculture agent for food safety
        await agentBus.sendMessage({
          from: 'health-agent',
          to: 'agriculture-agent',
          type: 'alert',
          payload: {
            alert: 'disease-outbreak',
            disease: message.payload.disease,
            affectedAreas: message.payload.areas
          },
          timestamp: new Date()
        });
      }
      return { acknowledged: true, action: 'disease-alert-processed' };
    case 'broadcast':
      // Handle broadcasts from other agents
      console.log(`Health agent received broadcast: ${JSON.stringify(message.payload)}`);
      return { acknowledged: true };
  }
  return { error: 'Unknown message type' };
});

const healthAgentPrompt = ai.definePrompt({
  name: 'healthAgentPrompt',
  input: { schema: HealthAgentInputSchema },
  output: { schema: HealthAgentOutputSchema },
  system: `You are the Health AI Agent for Cross River State Government Services.

**Your Capabilities:**
- Find nearest hospitals and healthcare facilities
- Book medical appointments
- Monitor disease outbreaks
- Coordinate vaccination drives
- Respond to medical emergencies

**Agent-to-Agent Communication:**
When handling requests, consider coordination with other agents:

**Coordinate with Emergency Agent:**
- Critical medical emergencies
- Mass casualty incidents
- Disease outbreaks requiring evacuation

**Coordinate with Agriculture Agent:**
- Food-borne illness outbreaks
- Agricultural worker health issues
- Nutrition-related health programs

**Coordinate with Security Agent:**
- Hospital security during emergencies
- Patient transport security
- Public health safety measures

**Coordinate with Infrastructure Agent:**
- Hospital power backup needs
- Medical facility maintenance
- Ambulance route planning

**Response Format:**
- Provide direct response to user request
- List any coordination actions needed
- Specify which agents to notify and why

Action: {{action}}
Location: {{location}}
Patient Info: {{patientInfo}}`,
});

const healthAgentFlow = ai.defineFlow(
  {
    name: 'healthAgentFlow',
    inputSchema: HealthAgentInputSchema,
    outputSchema: HealthAgentOutputSchema,
  },
  async (input) => {
    const llmResponse = await healthAgentPrompt(input);

    // Agent-to-agent coordination logic
    const coordination: any[] = [];

    if (input.action === 'disease-alert' && input.patientInfo?.urgency === 'critical') {
      // Coordinate emergency response
      coordination.push({
        agent: 'emergency-coordinator',
        message: 'Critical disease outbreak - coordinate multi-agency response',
        priority: 'critical'
      });
    }

    if (input.action === 'emergency-response') {
      // Notify security for patient transport
      coordination.push({
        agent: 'security-agent',
        message: 'Medical emergency - secure transport routes',
        priority: 'high'
      });
    }

    // Execute coordination if needed
    if (coordination.length > 0) {
      for (const coord of coordination) {
        try {
          await agentBus.sendMessage({
            from: 'health-agent',
            to: coord.agent,
            type: 'request',
            payload: {
              action: coord.message,
              location: input.location,
              priority: coord.priority
            },
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`Failed to coordinate with ${coord.agent}:`, error);
        }
      }
    }

    return {
      ...llmResponse.output,
      coordination: coordination.length > 0 ? coordination : undefined
    };
  }
);