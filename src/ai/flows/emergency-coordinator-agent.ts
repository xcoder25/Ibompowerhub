'use server';

/**
 * @fileOverview Emergency Coordination Agent - Coordinates between Health, Security, and Infrastructure agents
 */

import { ai, agentBus, AgentMessage } from '../genkit';
import { z } from 'genkit';

const EmergencyCoordinationInputSchema = z.object({
  incidentType: z.enum(['flood', 'fire', 'medical', 'security', 'infrastructure']),
  location: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  affectedCitizens: z.number().optional(),
});

export type EmergencyCoordinationInput = z.infer<typeof EmergencyCoordinationInputSchema>;

const EmergencyCoordinationOutputSchema = z.object({
  responsePlan: z.string(),
  agentsNotified: z.array(z.string()),
  estimatedResponseTime: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export type EmergencyCoordinationOutput = z.infer<typeof EmergencyCoordinationOutputSchema>;

export async function coordinateEmergency(input: EmergencyCoordinationInput): Promise<EmergencyCoordinationOutput> {
  return emergencyCoordinationFlow(input);
}

// Register this agent with the communication bus
agentBus.registerAgent('emergency-coordinator', async (message: AgentMessage) => {
  switch (message.type) {
    case 'request':
      if (message.payload.incidentType) {
        return await coordinateEmergency(message.payload);
      }
      break;
    case 'alert':
      // Handle incoming alerts from other agents
      console.log(`Emergency Coordinator received alert: ${message.payload}`);
      return { acknowledged: true };
  }
  return { error: 'Unknown message type' };
});

const emergencyCoordinationPrompt = ai.definePrompt({
  name: 'emergencyCoordinationPrompt',
  input: { schema: EmergencyCoordinationInputSchema },
  output: { schema: EmergencyCoordinationOutputSchema },
  system: `You are the Emergency Coordination AI Agent for Cross River State.

Your role is to coordinate responses between different service agents during emergencies.

Based on the incident details, determine which agents to notify and create a response plan:

**Agent Responsibilities:**
- Health Agent: Medical emergencies, disease outbreaks
- Security Agent: Crime, public safety, evacuations
- Infrastructure Agent: Power outages, road damage, water issues
- Agriculture Agent: Flood impact on farms, food security
- Transportation Agent: Road closures, evacuation routes

**Communication Protocol:**
1. Assess incident severity and location
2. Notify relevant agents simultaneously
3. Create coordinated response plan
4. Set priority levels and response times

**Agent-to-Agent Communication Examples:**
- Request health agent to prepare medical teams
- Alert security agent about evacuation needs
- Query infrastructure agent for road conditions
- Coordinate with agriculture agent for relief supplies

Incident: {{incidentType}} at {{location}}
Severity: {{severity}}
Description: {{description}}`,
});

const emergencyCoordinationFlow = ai.defineFlow(
  {
    name: 'emergencyCoordinationFlow',
    inputSchema: EmergencyCoordinationInputSchema,
    outputSchema: EmergencyCoordinationOutputSchema,
  },
  async (input) => {
    // First, coordinate with other agents
    const coordinationTasks = [];

    if (input.incidentType === 'flood') {
      // Notify multiple agents simultaneously
      coordinationTasks.push(
        agentBus.sendMessage({
          from: 'emergency-coordinator',
          to: 'infrastructure-agent',
          type: 'request',
          payload: { action: 'assess-flood-damage', location: input.location },
          timestamp: new Date()
        }),
        agentBus.sendMessage({
          from: 'emergency-coordinator',
          to: 'security-agent',
          type: 'request',
          payload: { action: 'coordinate-evacuation', location: input.location, severity: input.severity },
          timestamp: new Date()
        }),
        agentBus.sendMessage({
          from: 'emergency-coordinator',
          to: 'agriculture-agent',
          type: 'request',
          payload: { action: 'assess-crop-damage', location: input.location },
          timestamp: new Date()
        })
      );
    }

    // Wait for agent responses
    const agentResponses = await Promise.allSettled(coordinationTasks);

    // Generate coordinated response plan
    const llmResponse = await emergencyCoordinationPrompt(input);

    return {
      ...llmResponse.output,
      agentsNotified: ['infrastructure-agent', 'security-agent', 'agriculture-agent'],
      agentResponses: agentResponses.map((result, index) =>
        result.status === 'fulfilled' ? result.value : `Agent ${index + 1} failed`
      )
    };
  }
);