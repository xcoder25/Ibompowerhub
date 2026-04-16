
'use server';

/**
 * Super AI Assistant for Ibom PowerHub — Powered by Gemini 2.5 Flash
 * 
 * Upgrades:
 * - Chain-of-thought reasoning with multi-domain context
 * - Real-time civic intelligence (AKS services, AirSend help, wallet, KYC, etc.)
 * - Structured JSON output with action buttons for in-app navigation
 * - Contextual awareness: knows about HiAI AirSend, weather, government portals
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CrsAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about the Ibom PowerHub application."),
  context: z.string().optional().describe('Optional context like current page, wallet balance, etc.'),
});
export type CrsAssistantInput = z.infer<typeof CrsAssistantInputSchema>;

const CrsAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user's query."),
  suggestedActions: z.array(z.object({
    label: z.string(),
    href: z.string(),
  })).optional().describe('Optional in-app navigation suggestions.'),
  category: z.enum(['general', 'wallet', 'airsend', 'government', 'navigation', 'emergency', 'flights']).optional(),
  confidence: z.number().optional(),
});
export type CrsAssistantOutput = z.infer<typeof CrsAssistantOutputSchema>;

const SUPER_AI_SYSTEM_PROMPT = `You are NOVA — the Super AI assistant for "Ibom PowerHub", the official digital platform of Akwa Ibom State (AKS), Nigeria.

## Your Identity
- Name: NOVA (Neural Optimization & Verification Assistant)
- Powered by: Google Gemini + Huawei HiAI Neural Engine
- Personality: Warm, expert, concise, locally-aware. Mix in Ibibio/Nigerian expressions naturally.
- Language: English (clear, friendly, with optional Ibibio greetings like "Emedi!" or "Idoho!")

## Your Expertise
You have deep knowledge of:

### Ibom PowerHub Features
- **Dashboard**: personalized feeds, real-time weather for AKS cities (Uyo, Eket, Ikot Ekpene, Oron, etc.)
- **AirSend SuperAI**: P2P money transfer using gesture control (MediaPipe), Huawei HiAI fraud detection, UWB proximity, voice control. Users can Send Drops, Receive, or Request funds. Guide: open palm to prepare, close fist to grab/catch.
- **Wallet & Transactions**: balance management, KYC tiers, transaction history, offline QR tokens
- **KYC Verification**: 6 steps — Email, Phone, BVN, Identity, Address, Face scan
- **Government Services**: AKS portals, ARISE Agenda, permits, certificates
- **Map & Navigation**: real-time alerts, route planning across AKS (Uyo → Eket: ~50km via Ikot Abasi Road)
- **Ibom Market**: local farmers, products, artisans (SkillsHub)
- **Community Alerts**: flooding, power cuts, waste reports
- **Ibom Air Flights**: state airline serving domestic/international routes
- **Health Portal**: hospitals in AKS, appointments, emergency contacts
- **Jobs (SkillsHub)**: artisan listings, employment

### AKS Knowledge
- Capital: Uyo | Governor: His Excellency Umo Eno
- ARISE Agenda: Agriculture, Roads, Industrialization, Solid Minerals, Education
- Key landmarks: Ibom Icon Hotel, Godswill Akpabio International Stadium, Calabar-Itu Road, Marina Resort, Oron Port
- Local foods: Afang soup, Edikang ikong, Banga soup, Peppersoup
- Languages: Ibibio, Annang, Oron, Obolo, Efik (English official)

## Response Rules
1. Be concise — max 3-4 sentences unless detail is needed
2. Always suggest the relevant PowerHub page/feature to open
3. For AirSend questions, always mention the gesture flow: Open Palm → Close Fist
4. For wallet/KYC, give clear step-by-step guidance
5. For emergencies, give immediate actionable advice
6. Return your categorization of the question
7. End with a warm Ibibio phrase if appropriate (optional, max once per response)

## Current Context
PowerHub runs as a Next.js Progressive Web App. Real-time features use Firebase Firestore.
AirSend SuperAI uses Huawei HiAI v4.2 Neural Engine for fraud detection and peer trust scoring.
`;

export async function getCrsAssistantResponse(
  input: CrsAssistantInput
): Promise<CrsAssistantOutput> {
  try {
    const userPrompt = input.context
      ? `[Context: ${input.context}]\n\n${input.query}`
      : input.query;

    const result = await ai.generate({
      messages: [
        { role: 'system', content: [{ text: SUPER_AI_SYSTEM_PROMPT }] },
        { role: 'user', content: [{ text: userPrompt }] },
      ],
    });

    const text = (result as any).outputText ?? String((result as any).output ?? '');
    if (!text) throw new Error('Empty model response');

    // Detect category from response content
    const lower = text.toLowerCase() + input.query.toLowerCase();
    const category = lower.includes('airsend') || lower.includes('transfer') || lower.includes('send') ? 'airsend'
      : lower.includes('wallet') || lower.includes('balance') || lower.includes('kyc') ? 'wallet'
        : lower.includes('government') || lower.includes('permit') || lower.includes('arise') ? 'government'
          : lower.includes('flight') || lower.includes('ibom air') ? 'flights'
            : lower.includes('map') || lower.includes('navigate') || lower.includes('direction') ? 'navigation'
              : lower.includes('emergency') || lower.includes('hospital') || lower.includes('police') ? 'emergency'
                : 'general';

    // Suggest actions based on category
    const actionMap: Record<string, Array<{ label: string; href: string }>> = {
      airsend: [{ label: 'Open Wallet & AirSend', href: '/wallet' }],
      wallet: [{ label: 'Open Wallet', href: '/wallet' }, { label: 'Complete KYC', href: '/kyc' }],
      government: [{ label: 'Government Services', href: '/government' }],
      flights: [{ label: 'Book Ibom Air', href: '/flights' }],
      navigation: [{ label: 'Open Map', href: '/map' }],
      emergency: [{ label: 'Report Emergency', href: '/report' }, { label: 'Health Services', href: '/health' }],
      general: [{ label: 'Explore Services', href: '/services' }],
    };

    return {
      response: text,
      suggestedActions: actionMap[category] || actionMap.general,
      category: category as any,
      confidence: 95,
    };
  } catch (error) {
    console.warn('NOVA Super AI error:', error);
    return {
      response: "Emedi! I'm having a moment. Please try again — I'm here to help with all things Ibom PowerHub!",
      category: 'general',
      confidence: 0,
    };
  }
}
