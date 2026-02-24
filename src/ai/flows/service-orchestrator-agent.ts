'use server';

/**
 * @fileOverview Service Orchestration Agent - Coordinates complex multi-step government processes
 */

import { ai, agentBus, AgentMessage } from '../genkit';
import { z } from 'genkit';

const ServiceOrchestrationInputSchema = z.object({
  serviceType: z.enum([
    'business-registration',
    'land-acquisition',
    'subsidy-application',
    'grant-application',
    'permit-renewal',
    'citizen-onboarding'
  ]),
  citizenId: z.string(),
  requirements: z.record(z.any()),
});

export type ServiceOrchestrationInput = z.infer<typeof ServiceOrchestrationInputSchema>;

const ServiceOrchestrationOutputSchema = z.object({
  processId: z.string(),
  steps: z.array(z.object({
    step: z.number(),
    agent: z.string(),
    action: z.string(),
    status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
    estimatedTime: z.string()
  })),
  overallStatus: z.enum(['initiated', 'in-progress', 'completed', 'requires-review', 'failed']),
  nextAction: z.string(),
});

export type ServiceOrchestrationOutput = z.infer<typeof ServiceOrchestrationOutputSchema>;

export async function orchestrateService(input: ServiceOrchestrationInput): Promise<ServiceOrchestrationOutput> {
  return serviceOrchestrationFlow(input);
}

// Register orchestration agent
agentBus.registerAgent('service-orchestrator', async (message: AgentMessage) => {
  switch (message.type) {
    case 'request':
      return await orchestrateService(message.payload);
    case 'response':
      // Handle responses from other agents in the workflow
      return await handleWorkflowResponse(message);
  }
  return { acknowledged: true };
});

async function handleWorkflowResponse(message: AgentMessage) {
  // Update workflow status based on agent responses
  console.log(`Workflow update from ${message.from}:`, message.payload);

  // Continue to next step or handle failures
  if (message.payload.status === 'completed') {
    // Trigger next step in workflow
    const nextStep = await determineNextStep(message.correlationId!);
    if (nextStep) {
      await agentBus.sendMessage({
        from: 'service-orchestrator',
        to: nextStep.agent,
        type: 'request',
        payload: nextStep.payload,
        correlationId: message.correlationId,
        timestamp: new Date()
      });
    }
  }

  return { workflowUpdated: true };
}

async function determineNextStep(processId: string) {
  // Logic to determine next step based on current workflow state
  // This would typically query a database or state management system
  return null; // Placeholder
}

const serviceOrchestrationPrompt = ai.definePrompt({
  name: 'serviceOrchestrationPrompt',
  input: { schema: ServiceOrchestrationInputSchema },
  output: { schema: ServiceOrchestrationOutputSchema },
  system: `You are the Service Orchestration AI Agent for Cross River State.

Your role is to coordinate complex multi-step government processes that require multiple agents working together.

**Service Workflows:**

**Business Registration Process:**
1. Revenue Agent: Verify tax compliance
2. Security Agent: Background check
3. Infrastructure Agent: Facility inspection
4. Health Agent: Hygiene compliance (if applicable)
5. Final: Revenue Agent issues certificate

**Land Acquisition Process:**
1. Lands Agent: Verify ownership documents
2. Revenue Agent: Check property taxes
3. Survey Agent: Boundary verification
4. Legal Agent: Title search
5. Final: Lands Agent issues certificate

**Subsidy/Grant Application:**
1. Agriculture Agent: Verify farming status
2. Revenue Agent: Income verification
3. Community Agent: Social impact assessment
4. Final: Finance Agent disburses funds

**Agent Communication Pattern:**
- Send requests to agents in sequence
- Wait for completion before proceeding
- Handle failures and rollbacks
- Maintain audit trail of all communications

**Coordination Rules:**
- Each step must complete before next begins
- If step fails, notify citizen and provide remediation steps
- Track progress and provide status updates
- Ensure data consistency across all agents

Service Type: {{serviceType}}
Citizen ID: {{citizenId}}
Requirements: {{requirements}}`,
});

const serviceOrchestrationFlow = ai.defineFlow(
  {
    name: 'serviceOrchestrationFlow',
    inputSchema: ServiceOrchestrationInputSchema,
    outputSchema: ServiceOrchestrationOutputSchema,
  },
  async (input) => {
    const processId = `PROC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Define workflow steps based on service type
    const workflows: Record<string, any[]> = {
      'business-registration': [
        { step: 1, agent: 'revenue-agent', action: 'verify-tax-compliance', time: '2 hours' },
        { step: 2, agent: 'security-agent', action: 'background-check', time: '4 hours' },
        { step: 3, agent: 'infrastructure-agent', action: 'facility-inspection', time: '1 day' },
        { step: 4, agent: 'health-agent', action: 'hygiene-compliance', time: '2 hours' },
        { step: 5, agent: 'revenue-agent', action: 'issue-certificate', time: '1 hour' }
      ],
      'land-acquisition': [
        { step: 1, agent: 'lands-agent', action: 'verify-documents', time: '4 hours' },
        { step: 2, agent: 'revenue-agent', action: 'check-taxes', time: '2 hours' },
        { step: 3, agent: 'survey-agent', action: 'boundary-verification', time: '2 days' },
        { step: 4, agent: 'legal-agent', action: 'title-search', time: '1 day' },
        { step: 5, agent: 'lands-agent', action: 'issue-certificate', time: '4 hours' }
      ],
      'subsidy-application': [
        { step: 1, agent: 'agriculture-agent', action: 'verify-farming-status', time: '2 hours' },
        { step: 2, agent: 'revenue-agent', action: 'income-verification', time: '4 hours' },
        { step: 3, agent: 'community-agent', action: 'impact-assessment', time: '1 day' },
        { step: 4, agent: 'finance-agent', action: 'disburse-funds', time: '2 hours' }
      ],
      'grant-application': [
        { step: 1, agent: 'community-agent', action: 'verify-eligibility', time: '4 hours' },
        { step: 2, agent: 'revenue-agent', action: 'financial-check', time: '2 hours' },
        { step: 3, agent: 'legal-agent', action: 'compliance-review', time: '1 day' },
        { step: 4, agent: 'finance-agent', action: 'approve-grant', time: '4 hours' }
      ]
    };

    const workflow = workflows[input.serviceType] || [];

    // Start first step
    if (workflow.length > 0) {
      await agentBus.sendMessage({
        from: 'service-orchestrator',
        to: workflow[0].agent,
        type: 'request',
        payload: {
          action: workflow[0].action,
          citizenId: input.citizenId,
          requirements: input.requirements,
          processId
        },
        correlationId: processId,
        timestamp: new Date()
      });
    }

    const llmResponse = await serviceOrchestrationPrompt(input);

    return {
      ...llmResponse.output,
      processId,
      overallStatus: llmResponse.output.overallStatus || 'initiated',
      steps: workflow.map((step: any) => ({
        ...step,
        status: (step.step === 1 ? 'in-progress' : 'pending') as 'pending' | 'in-progress' | 'completed' | 'failed'
      }))
    };
  }
);