'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntentSchema = z.object({
    type: z.enum(['transfer', 'insight', 'unknown']).describe("Categorize the user's intent."),
    amount: z.number().optional().describe("For transfers, the amount in numbers."),
    recipient: z.string().optional().describe("For transfers, who the money goes to."),
    source: z.string().optional().describe("For transfers, where the money comes from (e.g. OWealth, balance)."),
    insightCategory: z.string().optional().describe("For insights, what category of spending they are asking about (e.g. Fuel, Food)."),
    sqlQuery: z.string().optional().describe("If type is insight, write a simulated SQL query to answer it. Format: SELECT SUM(amount) FROM transactions WHERE category = 'X' AND month = CURRENT_MONTH"),
    insightAnswer: z.string().optional().describe("If type is insight, simulate an answer amount in Naira based on a safe guess or placeholder value like 45000."),
    spokenResponse: z.string().describe("A conversational response acknowledging the action or giving the insight answer.")
});

export type VoiceBankingIntent = z.infer<typeof IntentSchema>;

const SYSTEM_PROMPT = `You are a dialect-aware Nigerian financial voice assistant. 
You can understand English, Yoruba, Igbo, Hausa, and Pidgin.
Extract the intent behind the user's spoken phrase.

If they want to transfer money (e.g. "Abeg send 2k to my wife from my OWealth balance" or "send 500 naria to john"):
- Set type="transfer", amount=2000, recipient="my wife", source="OWealth"
- In spokenResponse, say something natural acknowledging the transfer intent and asking for voice-print confirmation.

If they want to know their spending (e.g. "how much did I spend on fuel this month?"):
- Set type="insight", insightCategory="Fuel"
- Create a sqlQuery like SELECT SUM(amount) FROM transactions WHERE category = 'Fuel' AND month = CURRENT_MONTH
- Set insightAnswer to a random plausible amount like "₦45,000"
- In spokenResponse, say: "You have spent X on Y this month."

If you can't understand the intent, set type="unknown" and ask them to repeat.
Respond strictly in valid JSON matching the schema.`;

export async function processVoiceBankingIntent(transcript: string): Promise<VoiceBankingIntent> {
    try {
        const result = await ai.generate({
            messages: [
                { role: 'system', content: [{ text: SYSTEM_PROMPT }] },
                { role: 'user', content: [{ text: transcript }] },
            ],
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
