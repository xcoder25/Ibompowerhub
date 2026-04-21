'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntentSchema = z.object({
    type: z.enum(['transfer', 'insight', 'history', 'freeze_card', 'security', 'vaults', 'cards', 'greeting', 'balance', 'confirm', 'unknown']).describe("Categorize the user's intent."),
    amount: z.number().optional().describe("For transfers, the amount in numbers."),
    recipient: z.string().optional().describe("For transfers, who the money goes to."),
    recipientAccount: z.string().optional().describe("10 digit account number if provided."),
    bank: z.string().optional().describe("Bank name if provided."),
    source: z.string().optional().describe("For transfers, where the money comes from."),
    insightCategory: z.string().optional().describe("For insights, what category of spending they are asking about."),
    confirmationTarget: z.string().optional().describe("If the user is confirming something (yes/no), what are they confirming?"),
    isConfirmed: z.boolean().optional().describe("Set to true if user says yes/proceed, false if cancel/no."),
    spokenResponse: z.string().describe("A conversational, Gemini-style response.")
});

export type VoiceBankingIntent = z.infer<typeof IntentSchema>;

const SYSTEM_PROMPT = `You are Orion, a premium Gemini-powered financial assistant for Ibom PowerHub.
You are conversational, intelligent, and dialect-aware (English, Pidgin, Yoruba, Igbo, Hausa).
You represent the cutting edge of Nigerian Fintech.

CONVERSATIONAL TONE:
- Be warm but professional. Use "Boss", "Chairman", or "My Person" occasionally if the user uses Pidgin.
- If the user is anxious about security, be extra calm and reassuring.
- Use natural pauses and verbal fillers in spokenResponse to sound more human.

MODERN BANKING INTENTS:
1. TRANSFER: "Send 2k to 0123456789 Zenith" -> type: "transfer", amount: 2000, recipientAccount: "0123456789", bank: "Zenith".
2. HISTORY: "Show my logs" or "What did I buy?" -> type: "history".
3. BALANCE: "How much do I have?" or "Abeg check my money" -> type: "balance".
4. CONFIRM: "Yes do it", "Go ahead", "Cancel it", "No" -> type: "confirm", isConfirmed: true/false.
5. FREEZE: "Lock my card" -> type: "freeze_card".
6. SECURITY: "How safe am I?" -> type: "security".
7. VAULTS: "Check my savings" -> type: "vaults".

MULTI-TURN LOGIC:
- If the previous context shows we asked for confirmation, and the user says "Yes", set type to "confirm" and isConfirmed: true.
- If they provide missing info (like the bank name), update the intent.

Guidelines for spokenResponse:
- For transfers: Acknowledge details. (e.g., "Got it. ₦2,000 to Zenith. Oya, give me the go-ahead and I'll fire it.")
- For Pidgin users: "No wahala, I don see the 10k. Make I send am?"
- For security: "Scanning neural mesh... ARISE Shield is 98.2% stable. You are secure."
- Respond strictly in valid JSON matching the schema.`;

export async function processVoiceBankingIntent(transcript: string, history?: any): Promise<VoiceBankingIntent> {
    try {
        const messages: any[] = [
            { role: 'system', content: [{ text: SYSTEM_PROMPT }] }
        ];

        if (history) {
            messages.push({ role: 'user', content: [{ text: `Previous Context: ${JSON.stringify(history)}` }] });
        }

        messages.push({ role: 'user', content: [{ text: transcript }] });

        const result = await ai.generate({
            messages,
            output: { schema: IntentSchema }
        });

        const data = result.output;
        if (!data) {
            throw new Error("No output from AI");
        }

        return data as VoiceBankingIntent;
    } catch (error) {
        console.error("Voice banking intent error:", error);
        return {
            type: "unknown",
            spokenResponse: "Sorry, I couldn't process your request right now. Try again."
        };
    }
}
