'use server';

/**
 * @fileOverview Integrated AI Agent System - Shows how agents communicate in real-time
 */

import { agentBus, AgentMessage } from './genkit';
import { coordinateEmergency } from './emergency-coordinator-agent';
import { processHealthRequest } from './health-agent';
import { orchestrateService } from './service-orchestrator-agent';

// Initialize all agents
export async function initializeAIAgents() {
  // Agents are already registered in their respective files
  console.log('AI Agent Communication System initialized');
}

// Example: Flood Emergency Scenario
export async function handleFloodEmergency(location: string, severity: 'high' | 'critical') {
  console.log(`🚨 Flood emergency detected at ${location}, severity: ${severity}`);

  // Emergency coordinator takes lead
  const coordinationResult = await coordinateEmergency({
    incidentType: 'flood',
    location,
    severity,
    description: `Major flooding reported in ${location}. Immediate evacuation may be required.`,
    affectedCitizens: 500
  });

  console.log('Coordination Result:', coordinationResult);

  // Broadcast alert to all citizens in affected area
  await agentBus.broadcastMessage(
    'emergency-coordinator',
    'alert',
    {
      type: 'flood-warning',
      location,
      severity,
      instructions: 'Move to higher ground immediately. Avoid flooded areas.',
      emergencyContacts: ['Police: 112', 'Fire: 113', 'Health: 114']
    }
  );

  return coordinationResult;
}

// Example: Disease Outbreak Coordination
export async function handleDiseaseOutbreak(disease: string, affectedAreas: string[]) {
  console.log(`🦠 Disease outbreak: ${disease} in ${affectedAreas.join(', ')}`);

  // Health agent initiates coordination
  const healthResponse = await processHealthRequest({
    action: 'disease-alert',
    location: affectedAreas[0],
    patientInfo: {
      symptoms: `Outbreak of ${disease}`,
      urgency: 'high'
    }
  });

  console.log('Health Coordination:', healthResponse);

  // Agriculture agent checks food supply chain
  await agentBus.sendMessage({
    from: 'health-agent',
    to: 'agriculture-agent',
    type: 'alert',
    payload: {
      alert: 'food-safety-check',
      disease,
      areas: affectedAreas,
      action: 'Inspect food supply chain for contamination'
    },
    timestamp: new Date()
  });

  return healthResponse;
}

// Example: Complex Service Workflow
export async function processBusinessRegistration(citizenId: string, businessDetails: any) {
  console.log(`🏢 Starting business registration for citizen ${citizenId}`);

  const orchestrationResult = await orchestrateService({
    serviceType: 'business-registration',
    citizenId,
    requirements: businessDetails
  });

  console.log('Service Orchestration Started:', orchestrationResult);

  // Monitor workflow progress (in a real app, this would be event-driven)
  return orchestrationResult;
}

// Real-time agent communication monitoring
export async function getAgentCommunicationStatus() {
  // In a real implementation, this would query a message queue or database
  return {
    activeAgents: Array.from(agentBus['agents'].keys()),
    recentCommunications: [
      {
        timestamp: new Date(),
        from: 'emergency-coordinator',
        to: 'health-agent',
        type: 'request',
        status: 'completed'
      },
      {
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        from: 'health-agent',
        to: 'agriculture-agent',
        type: 'alert',
        status: 'completed'
      }
    ],
    systemHealth: 'operational'
  };
}

// Example usage in dashboard component
export async function demonstrateAgentCommunication() {
  // Initialize agents
  await initializeAIAgents();

  // Simulate various scenarios
  const results = {
    floodEmergency: await handleFloodEmergency('Calabar South', 'high'),
    diseaseOutbreak: await handleDiseaseOutbreak('Malaria', ['Calabar Municipality', 'Odukpani']),
    businessRegistration: await processBusinessRegistration('CIT_001', {
      businessName: 'AgroTech Solutions',
      type: 'Technology',
      location: 'Calabar'
    }),
    systemStatus: await getAgentCommunicationStatus()
  };

  return results;
}