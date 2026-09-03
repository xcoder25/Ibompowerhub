'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ─── Intent Schema ────────────────────────────────────────────────────────────
const IntentSchema = z.object({
    type: z.enum([
        'transfer', 'balance', 'insight', 'history',
        'freeze_card', 'unfreeze_card', 'security',
        'bill_pay', 'vaults', 'cards', 'greeting', 'confirm', 'unknown'
    ]).describe("Categorize the user's banking intent."),

    amount: z.number().optional().describe("Transfer/payment amount in naira as a number."),
    recipient: z.string().optional().describe("Recipient name for transfers."),
    recipientAccount: z.string().optional().describe("10-digit account number if provided."),
    bank: z.string().optional().describe("Target bank or fintech e.g. GTBank, OPay, Zenith Bank, Moniepoint, PalmPay."),
    source: z.string().optional().describe("Source account: balance, OWealth, vault, main."),

    insightCategory: z.string().optional().describe("Spending category for insights e.g. Fuel, Food, Transport, Rent, Electricity."),
    sqlQuery: z.string().optional().describe("Simulated SQL for the insight query."),
    insightAnswer: z.string().optional().describe("Simulated spending amount in Naira for the insight."),
    insightPeriod: z.string().optional().describe("Time period for insight: this month, last week, today."),

    billType: z.string().optional().describe("Bill type: airtime, data, electricity, cable_tv, water."),
    billPhone: z.string().optional().describe("Phone number for airtime or data top-up."),

    isConfirmed: z.boolean().optional().describe("True if user says yes or proceed, false if cancel or no."),
    confirmationTarget: z.string().optional().describe("What the user is confirming."),

    isAmbiguous: z.boolean().optional().describe("True if crucial parameters are missing or unclear."),
    clarificationQuestion: z.string().optional().describe("A prompt asking for the missing detail if isAmbiguous is true."),

    detectedDialect: z.enum(['ibibio', 'pidgin', 'english', 'code-switching']).describe("The dialect detected in the user input."),

    spokenResponse: z.string().describe("Native dialect conversational response for TTS playback."),
    englishTranslation: z.string().optional().describe("English translation of spokenResponse if dialect is Ibibio or code-switching."),

    confidence: z.number().describe("AI confidence score 0.0 to 1.0."),
});

export type VoiceBankingIntent = z.infer<typeof IntentSchema>;

// ─── Dialect-Aware System Prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Orion, the Dialect-Aware Voice Banking Agent for Ibom PowerHub — a premium Gemini-powered AI financial assistant built for Akwa Ibom State, Nigeria. You are fluent in English, Nigerian Pidgin, and Ibibio/Annang/Efik and you code-switch naturally like people from Akwa Ibom do.

DIALECT DETECTION AND RESPONSE:
Detect the user dialect from input and respond in the SAME dialect.
Ibibio/Annang/Efik markers: no okuk, kpeme owo, nse okuk mi, dok okuk, sio okuk, ao, ao nnam, dodo, emedi, sosong, ikimi, tosin, tossin, duop, kiet, ition, ikim, fi okuk, kpe mbuk, kpeme kadi
Nigerian Pidgin markers: abeg, no wahala, oya fire am, sharp sharp, my guy, chook am, aza, guas, racks, nna, oga

IBIBIO FINANCIAL NUMBERS (convert to numbers always):
kiet=1, iba=2, ita=3, inaang=4, ition=5, itiokiet=6, itiaba=7, itiaita=8, usukkiet=9, duop=10, ikim=100, ikimi=1000, tosin=1000, tossin=1000, milyon=1000000, million=1000000
tosin ition=5000, tosin duop=10000, tosin duop duop=20000, ikimi ikim=100000

IBIBIO BANKING ACTIONS:
no okuk / kpeme owo / kpeme okuk = transfer/send money
sio okuk = withdraw
dok okuk = deposit/top up
nse okuk mi / nse owo mi = check balance
kpeme kadi mi = freeze/lock card
kpe mbuk = pay bill
nse akpa mi = show transactions
fi okuk = receive money
Ibibio affirmations: ao / ao nnam / yak nnam / emesiere = yes/proceed
Ibibio denials: dodo / ukpok / cancel am / no do am = cancel/stop

NIGERIAN PIDGIN AMOUNTS (convert to numbers always):
5k=5000, 10k=10000, 20k=20000, 50k=50000, 100k=100000, 500k=500000
5 grand / 5 guas = 5000, 10 grand / 10 guas = 10000
N racks = N times 1000 e.g. 50 racks = 50000
1 meter / 1 mil = 1000000, 2 meter = 2000000
Pidgin affirmations: oya fire am / e correct / no wahala / do am now = yes/proceed
Pidgin denials: abeg cancel am / no do am / joor forget am / e no correct = cancel

AKWA IBOM NAMES for recipient:
Bassey, Emem, Edidiong, Udeme, Kufre, Nsikak, Utibe, Ini, Eno, Ubong, Idara, Imaobong, Ekanem, Atim, Edem, Uduak, Eseme, Aniekan, Mfonobong, Etim, Okon, Iniubong, Etiowo, Ntiense, Nkoyo, Abasifreke, Effiong, Okim, Unwana, Anietie, Nse, Ekpenyong, Affiong, Idorenyin.

BANK NAME RESOLUTION:
GTB/GTBank/Guaranty -> GTBank, Zenith/Zenith Bank -> Zenith Bank, Access/Access Bank -> Access Bank, UBA/United Bank -> UBA, OPay/O Pay -> OPay, Moniepoint/Monie Point -> Moniepoint, PalmPay/Palm Pay -> PalmPay, Kuda/Kuda Bank -> Kuda, First/First Bank/FBN -> First Bank

INTENT CLASSIFICATION:
1. TRANSFER: Send money. Extract amount, recipient, bank. If amount OR recipient missing set isAmbiguous=true.
2. BALANCE: how much i get / nse okuk mi / abeg check my money / check my aza -> balance
3. INSIGHT: how much I spend on food / how much I blow on transport -> insight with insightCategory, sqlQuery, insightAnswer.
4. HISTORY: show my logs / nse akpa mi / what did I buy -> history
5. FREEZE_CARD: lock my card / kpeme kadi mi / block my card sharp sharp -> freeze_card
6. UNFREEZE_CARD: unlock my card -> unfreeze_card
7. BILL_PAY: buy airtime / buy data / pay light bill / iedc token -> bill_pay with billType
8. CONFIRM: ao nnam / oya fire am / e correct -> isConfirmed=true. dodo / cancel am -> isConfirmed=false
9. GREETING: emedi / hello orion / oga orion / good morning -> greeting
10. UNKNOWN: confidence<0.4, isAmbiguous=true, ask to repeat.

RESPONSE STYLE (match user dialect):

Ibibio (always include englishTranslation):
- Transfer detected: "Emedi! Mme dong no okuk N{amount} ma {recipient}. Ao nnam?" | Translation: "Welcome! I have set up a transfer of N{amount} to {recipient}. Shall I proceed?"
- Balance: "Idem edi ke N{balance} di balance ami." | Translation: "Your balance is N{balance}."
- Freeze: "Kpeme kadi fi dong done. Udeme ifi." | Translation: "Your card has been locked. Stay safe."

Pidgin:
- Transfer: "No wahala, I don see N{amount}. Make I send am to {recipient}?"
- Balance: "Your aza dey show N{balance}. You good, Boss?"
- Freeze: "I don lock your card sharp sharp. You safe, Chairman."
- Insight: "You don blow N{amount} on {category} this month, my person."

English:
- Transfer: "Got it. I've detected a transfer of N{amount} to {recipient} at {bank}. Shall I proceed?"
- Balance: "Your current balance is N{balance}. All looks good."

Mix in Ibibio greetings naturally: Emedi!, Idoho!, Sosong!
For unknown: Pidgin say "I beg, I no hear you well — say am again?" or Ibibio say "Ke sere, try again."
ALWAYS return strictly valid JSON matching the schema.`;

// ─── Offline Fallback Heuristics ─────────────────────────────────────────────
function fallbackParse(transcript: string): VoiceBankingIntent | null {
    const lower = transcript.toLowerCase().trim();

    let amount: number | undefined;
    const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*k\b/);
    if (kMatch) amount = parseFloat(kMatch[1]) * 1000;
    const nairaMatch = lower.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*naira/);
    if (!amount && nairaMatch) amount = parseFloat(nairaMatch[1].replace(/,/g, ''));
    const numMatch = lower.match(/\b(\d{3,7})\b/);
    if (!amount && numMatch) amount = parseInt(numMatch[1]);

    const toMatch = lower.match(/\bto\s+([a-z]+)/);
    const recipient = toMatch ? toMatch[1] : undefined;

    const bankMap: Record<string, string> = {
        'gtb': 'GTBank', 'gtbank': 'GTBank', 'guaranty': 'GTBank',
        'zenith': 'Zenith Bank', 'access': 'Access Bank', 'uba': 'UBA',
        'opay': 'OPay', 'moniepoint': 'Moniepoint', 'palmpay': 'PalmPay',
        'kuda': 'Kuda', 'first': 'First Bank',
    };
    let bank: string | undefined;
    for (const [key, val] of Object.entries(bankMap)) {
        if (lower.includes(key)) { bank = val; break; }
    }

    const isTransfer = /send|transfer|no okuk|kpeme owo|send am/.test(lower);
    const isBalance = /balance|how much|nse okuk|check my|aza|owo mi|i get/.test(lower);
    const isHistory = /history|transaction|logs|akpa mi|what did i/.test(lower);
    const isFreeze = /lock|freeze|block|kpeme kadi/.test(lower);
    const isGreeting = /hello|emedi|oga orion|good morning|hi orion|boss orion/.test(lower);
    const isConfirmYes = /\bao\b|^yes$|oya fire|no wahala|ao nnam|e correct|do am|^proceed$/.test(lower);
    const isConfirmNo = /^no$|^dodo$|cancel|abort|stop it|no do am/.test(lower);
    const isInsight = /how much.*spend|spent on|blow on|expense/.test(lower);

    if (isGreeting) return { type: 'greeting', detectedDialect: 'english', confidence: 0.9, spokenResponse: 'Emedi! Welcome to Orion Voice Banking. How can I help you today?' };
    if (isConfirmYes) return { type: 'confirm', isConfirmed: true, confirmationTarget: 'previous action', detectedDialect: 'english', confidence: 0.9, spokenResponse: 'Confirmed. Processing now...' };
    if (isConfirmNo) return { type: 'confirm', isConfirmed: false, confirmationTarget: 'previous action', detectedDialect: 'english', confidence: 0.9, spokenResponse: 'Cancelled. No wahala.' };
    if (isBalance) return { type: 'balance', detectedDialect: 'english', confidence: 0.85, spokenResponse: 'Let me pull up your balance right now...' };
    if (isHistory) return { type: 'history', detectedDialect: 'english', confidence: 0.85, spokenResponse: 'Showing your recent transactions...' };
    if (isFreeze) return { type: 'freeze_card', detectedDialect: 'english', confidence: 0.9, spokenResponse: 'Locking your card now. You safe.' };
    if (isInsight) {
        const catMatch = lower.match(/(?:on|for)\s+([a-z]+)/);
        const cat = catMatch ? catMatch[1].charAt(0).toUpperCase() + catMatch[1].slice(1) : 'General';
        return {
            type: 'insight', insightCategory: cat, insightPeriod: 'this month', detectedDialect: 'english',
            confidence: 0.8, spokenResponse: `Analyzing your ${cat} spending for this month...`,
            sqlQuery: `SELECT SUM(amount) FROM transactions WHERE category = '${cat}' AND period = 'this_month'`,
            insightAnswer: '₦' + (Math.floor(Math.random() * 40 + 10)) + ',500',
        };
    }
    if (isTransfer) {
        if (!amount || !recipient) {
            return {
                type: 'transfer', amount, recipient, bank, isAmbiguous: true,
                clarificationQuestion: !amount ? 'How much do you want to send?' : 'Who should I send it to?',
                detectedDialect: 'english', confidence: 0.6,
                spokenResponse: !amount ? 'I got a transfer intent — how much should I send?' : `Sure! Who should I send ₦${amount?.toLocaleString()} to?`,
            };
        }
        return {
            type: 'transfer', amount, recipient, bank, isAmbiguous: false, detectedDialect: 'english',
            confidence: 0.8,
            spokenResponse: `Set up ₦${amount.toLocaleString()} to ${recipient}${bank ? ' at ' + bank : ''}. Shall I proceed?`,
        };
    }
    return null;
}

// ─── Main exported function ───────────────────────────────────────────────────
export async function processVoiceBankingIntent(
    transcript: string,
    history?: any,
    preferredDialect?: string
): Promise<VoiceBankingIntent> {
    try {
        const messages: any[] = [
            { role: 'system', content: [{ text: SYSTEM_PROMPT }] },
        ];

        if (preferredDialect && preferredDialect !== 'auto') {
            messages.push({
                role: 'system',
                content: [{ text: `User preferred dialect is "${preferredDialect}". Respond primarily in this dialect.` }],
            });
        }

        if (history) {
            messages.push({ role: 'user', content: [{ text: `Conversation context: ${JSON.stringify(history)}` }] });
        }

        messages.push({ role: 'user', content: [{ text: transcript }] });

        const result = await ai.generate({ messages, output: { schema: IntentSchema } });
        const data = result.output;
        if (!data) throw new Error('No output from AI');
        return data as VoiceBankingIntent;

    } catch (error) {
        console.error('Voice banking intent error:', error);
        const fallback = fallbackParse(transcript);
        if (fallback) return fallback;
        return {
            type: 'unknown',
            detectedDialect: 'english',
            confidence: 0,
            isAmbiguous: true,
            spokenResponse: "I beg, I no hear you well — please say am again slowly.",
        };
    }
}
