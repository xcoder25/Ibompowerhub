
 'use server';

 /**
  * Simple Genkit-powered assistant for PowerHub CRS.
  *
  * We bypass the higher-level prompt/flow wrappers (which were throwing
  * `content` errors) and call `ai.generate` directly.
  *
  * IMPORTANT: Because this file uses "use server", the only *runtime* export
  * must be an async function (for Next.js server actions). Any other values
  * (schemas, constants) must remain internal.
  */

 import { ai } from '@/ai/genkit';
 import { z } from 'genkit';

// Schemas are kept internal so that the only runtime export is the async
// server action function below.
const CrsAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about the PowerHub CRS application."),
});
export type CrsAssistantInput = z.infer<typeof CrsAssistantInputSchema>;

const CrsAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user's query."),
});
export type CrsAssistantOutput = z.infer<typeof CrsAssistantOutputSchema>;

const SYSTEM_PROMPT = `You are an expert AI assistant for the "PowerHub CRS" application.
Your job is to answer questions about Cross River State (CRS) services and the PowerHub app.
Be clear, concise, and always give next steps inside the app (which page to open, which button to tap, etc.).

You have complete knowledge of all features within PowerHub CRS, including:
- Dashboard (personalized overview, community activity, recent reports)
- Map View & Directions (live map, alerts, and helping users find & navigate to any location in CRS)
- Services directory (all government and community services)
- AgroConnect Market (local farmers & products)
- SkillsHub (artisans and service providers)
- Transport Guide (fares and routes)
- Community Alerts (reports like power outages, flooding, waste issues)
- Profile and Wallet
- The in‑app AI Assistant (you).

For location and navigation questions, always:
- Restate the origin and destination (or area) in CRS.
- Tell the user to open the Map page in PowerHub.
- Explain what to type in the origin and destination fields.
- Optionally describe the likely route and key landmarks in simple steps.
`;

export async function getCrsAssistantResponse(
  input: CrsAssistantInput
): Promise<CrsAssistantOutput> {
  try {
    const result = await ai.generate({
      messages: [
        { role: 'system', content: [{ text: SYSTEM_PROMPT }] },
        { role: 'user', content: [{ text: input.query }] },
      ],
    });

    // Genkit GoogleAI plugin exposes the main text as `outputText`
    const text = (result as any).outputText ?? String((result as any).output ?? '');

    if (!text) {
      throw new Error('Empty model response');
    }

    return { response: text };
  } catch (error) {
    console.warn('getCrsAssistantResponse error:', error);
    return {
      response:
        "Sorry, I couldn't process that just now. Please try again in a moment or rephrase your question.",
    };
  }
}
