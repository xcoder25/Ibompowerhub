'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntentSchema = z.object({
    type: z.enum(['transfer', 'insight', 'unknown']).describe("Categorize the user's intent."),
    amount: z.number().optional().describe("For transfers, the amount in numbers."),
    recipient: z.string().optional().describe("For transfers, who the money goes to."),
    source: z.string().optional().describe("For transfers, where the money comes from (e.g. OWealth, balance)."),
    bank: z.string().optional().describe("For transfers, the target bank if specified (e.g. GTBank, Access Bank, OPay, Zenith Bank, PalmPay, UBA)."),
    insightCategory: z.string().optional().describe("For insights, what category of spending they are asking about (e.g. Fuel, Food, Transport, Rent, Electricity)."),
    sqlQuery: z.string().optional().describe("If type is insight, write a simulated SQL query to answer it."),
    insightAnswer: z.string().optional().describe("If type is insight, simulate an answer amount in Naira."),
    spokenResponse: z.string().describe("A conversational response acknowledging the action, asking clarification, or giving the insight answer."),
    confidence: z.number().describe("AI confidence score from 0.0 to 1.0 on how well it understood and extracted this intent."),
    isAmbiguous: z.boolean().describe("True if some crucial parameters (like amount or recipient) are missing or unclear for a transfer."),
    clarificationQuestion: z.string().optional().describe("If isAmbiguous is true, a prompt/question asking the user for the missing details.")
});

export type VoiceBankingIntent = z.infer<typeof IntentSchema>;

const SYSTEM_PROMPT = `You are a dialect-aware Nigerian financial voice assistant.
You understand English, Yoruba, Igbo, Hausa, Pidgin, and Ibibio/Efik phrases.

Understand local phrases/lingo:
- "send 5k" or "send 5 grand" or "send 5 guas" -> amount=5000
- "send 2 naira" -> amount=2
- "send 20k to Emem" -> amount=20000, recipient="Emem"
- "send five thousand naira to Udeme" -> amount=5000, recipient="Udeme"
- "send 10k to Kufre GTB" or "transfer 10k to Kufre on GTBank" -> amount=10000, recipient="Kufre", bank="GTBank"
- "transfer ten thousand to Nsikak at Zenith Bank" -> amount=10000, recipient="Nsikak", bank="Zenith Bank"
- "Kpeme owo 5k" or "nọ owo 5k" or "nọ okuk 5k to Bassey" (Ibibio/Efik phrases for giving/sending money) -> amount=5000, recipient="Bassey"
- "how much did I spend on transport?" or "how much did I blow on food?" -> type="insight", insightCategory="Transport"/"Food"

Extract the intent behind the user's spoken phrase.
If they want to transfer money:
- Set type="transfer"
- Detect if the transaction parameters are complete (amount, recipient are crucial). If recipient or amount is missing or ambiguous, set isAmbiguous=true, and write a helpful clarificationQuestion.
- Extract recipient, amount (as a number), source (if specified, e.g., "balance", "OWealth", "Main"), and bank (if specified, e.g., "GTBank", "Access Bank", "OPay", "Zenith Bank", "PalmPay", "UBA").
- Rate your extraction confidence from 0.0 to 1.0. If you are extremely certain, confidence should be >= 0.85. If something is missing/unclear, lower the confidence.
- In spokenResponse, say something natural acknowledging the transfer intent, e.g., "I've set up a transfer of ₦{amount} to {recipient} at {bank}. Please confirm with your voice print." (or if ambiguous, state the clarification question).

If they want to know their spending:
- Set type="insight", insightCategory (e.g. "Fuel", "Food", "Transport", "Electricity")
- Create a sqlQuery like SELECT SUM(amount) FROM transactions WHERE category = 'Fuel' AND month = CURRENT_MONTH
- Set insightAnswer to a plausible amount in Naira based on a safe guess (e.g., ₦25,000, ₦45,000)
- Rate your extraction confidence.
- In spokenResponse, say: "You have spent {insightAnswer} on {insightCategory} this month."

If you can't understand the intent, set type="unknown", confidence < 0.4, isAmbiguous=true, and ask them to repeat in spokenResponse.
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
            confidence: 0,
            isAmbiguous: true,
            spokenResponse: "Sorry, I couldn't process your request right now. Try again."
        };
    }
}

