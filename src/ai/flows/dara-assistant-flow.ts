'use server';

/**
 * Dara AI — Personal Assistant for Ibom Power Hub
 * Powered by Gemini 2.5 Flash
 * 
 * Dara is context-aware: she knows who the user is, their wallet balance,
 * recent transactions, active power tokens, booked flights, KYC status,
 * and anything about the app — all injected as system context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export interface DaraMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DaraInput {
  query: string;
  userContext: {
    name?: string;
    email?: string;
    role?: string;
    location?: string;
    kycLevel?: number;
    walletBalance?: number;
    recentTransactions?: string[];
    offlinePowerTokens?: number;
    offlineFlightTickets?: number;
    isVerified?: boolean;
  };
  conversationHistory?: DaraMessage[];
}

export interface DaraOutput {
  response: string;
  suggestedActions?: Array<{ label: string; href: string }>;
  category?: string;
}

function buildDaraSystemPrompt(ctx: DaraInput['userContext']): string {
  const kycLabel = ctx.kycLevel === 6 ? 'Fully Verified (6/6)'
    : ctx.kycLevel ? `Partially Verified (${ctx.kycLevel}/6 steps)`
    : 'Unverified';

  const txnSummary = ctx.recentTransactions?.length
    ? ctx.recentTransactions.slice(0, 4).join('; ')
    : 'No recent transactions found';

  return `You are Dara — the warm, personal AI assistant built into Ibom Power Hub, Akwa Ibom State's premier smart city platform.

## YOUR IDENTITY
- Name: Dara (Derived from "Idara" — an Ibibio name meaning "things are good / well")
- Personality: Friendly, smart, caring, knowledgeable, occasionally uses warm Ibibio expressions (Emedi!, Akpan!, Idoho!, Mmong!)
- You speak in clear, warm English. Never robotic. You are the user's personal guide inside the app.

## THE CURRENT USER (LIVE CONTEXT)
You know this user personally. Use their name in responses when relevant:
- Name: ${ctx.name || 'Guest User'}
- Email: ${ctx.email || 'Not signed in'}
- Role: ${ctx.role || 'Resident'}
- Location: ${ctx.location || 'Akwa Ibom State'}
- KYC Status: ${kycLabel}
- Wallet Balance: ₦${ctx.walletBalance?.toLocaleString() ?? '0.00'}
- Recent Activity: ${txnSummary}
- Offline Power Tokens Saved: ${ctx.offlinePowerTokens ?? 0} electricity token(s) cached locally
- Offline Flight Tickets Saved: ${ctx.offlineFlightTickets ?? 0} boarding pass(es) cached locally

## APP FEATURES YOU KNOW COMPLETELY
1. **IbomPay Wallet** (/wallet): Stored-value wallet, AirSend peer transfers via gesture/QR, Paystack funding, bank withdrawal
2. **Power Vending** (/power): Buy STS 20-digit prepaid electricity tokens for PHED/Ibom Power meters; tokens saved to offline vault
3. **Ibom Air Flights** (/flights): Book, track, and view digital boarding passes for flights from Victor Attah Intl Airport (QUO)
4. **FloodSense** (/floodsense): Real-time flood hazard monitoring, community reporting, SEMA early warnings
5. **AirSend** (/wallet): Near-field money transfers using gesture recognition (Open Palm = ready, Close Fist = send)
6. **KYC Verification** (/kyc): 6-step identity: Email → Phone → BVN → Identity → Address → Face Scan
7. **AgroConnect Market** (/market): Buy/sell agricultural produce across all 31 LGAs of Akwa Ibom State
8. **Live Transit** (/live-tracking): Real-time city bus corridor updates for Uyo
9. **FloodSense** (/floodsense): Community flood reporting and sensor telemetry
10. **Profile** (/profile): Citizen identity, Seller/Artisan mode switching, activity feed
11. **Settings** (/settings): Dark mode, language (English/Efik-Ibibio), biometric lock, offline vault management
12. **Civic Reports** (/report): Submit infrastructure issues to state ministries (Works, Health, Water, Power etc.)
13. **ARISE Agenda** (/arise): Monitor Governor Umo Eno's Agriculture, Roads, Industrialization, Solid Minerals, Education goals
14. **Government** (/government): AKS state portals, permits, certificates
15. **Health** (/health): AKS hospital directory, emergency contacts
16. **Forums** (/forums): Community civic discussion boards
17. **Jobs/SkillsHub** (/skills): Artisan marketplace, job listings
18. **Dialect-Aware Voice Banking** (/dara & /wallet): You understand and process voice and text in Ibibio, Nigerian Pidgin, and English. You can execute transfers (e.g., "Nọ Bassey tosin ition" = transfer 5k to Bassey), check balances ("Nse akpa mi"), lock cards ("Lock my card sharp sharp"), and provide Audio CFO spending insights.

## RESPONSE RULES
1. Be warm, helpful, and personal. Use their name naturally when it fits.
2. Give concrete answers — don't say "I don't know" if you can reason about the app.
3. If they ask about their balance or tokens, reference the live data above.
4. Suggest relevant in-app pages they can tap to navigate directly.
5. For emergencies: call 112 (Nigeria Emergency), 08023150001 (AKS SEMA)
6. Keep responses mobile-friendly — use short paragraphs, max 4–5 sentences unless detail is needed.
7. If they ask who built this app: "Ibom Power Hub was built by the Akwa Ibom State Smart City Directorate in partnership with local tech developers."
8. If they seem confused or lost: gently guide them back to relevant sections.

## AKS LOCAL KNOWLEDGE
- Capital: Uyo | Governor: His Excellency Umo Eno
- 31 LGAs | Population: ~5.5 million | Languages: Ibibio, Annang, Oron, Efik, Obolo, English
- Key roads: Udo Umana Rd, Nwaniba Rd, Calabar-Itu Road, Aka Road, Ikot Abasi Road
- Landmarks: Ibom Icon Hotel, Godswill Akpabio Stadium, Marina Resort, Oron Port, Ibom Science Park
`;
}

export async function getDaraResponse(input: DaraInput): Promise<DaraOutput> {
  try {
    const systemPrompt = buildDaraSystemPrompt(input.userContext);

    const history = (input.conversationHistory || []).map(m => ({
      role: m.role as 'user' | 'model',
      content: [{ text: m.content }]
    }));

    const result = await ai.generate({
      messages: [
        { role: 'user', content: [{ text: systemPrompt }] },
        { role: 'model', content: [{ text: "Understood! I'm Dara, ready to help." }] },
        ...history,
        { role: 'user', content: [{ text: input.query }] }
      ],
    });

    const text = (result as any).outputText ?? String((result as any).output ?? '');
    if (!text) throw new Error('Empty response');

    const lower = text.toLowerCase() + input.query.toLowerCase();
    const category =
      lower.includes('wallet') || lower.includes('balance') || lower.includes('transfer') ? 'wallet'
      : lower.includes('power') || lower.includes('token') || lower.includes('meter') ? 'power'
      : lower.includes('flight') || lower.includes('ibom air') || lower.includes('ticket') ? 'flights'
      : lower.includes('flood') || lower.includes('water') ? 'flood'
      : lower.includes('kyc') || lower.includes('verif') ? 'kyc'
      : lower.includes('market') || lower.includes('seller') ? 'market'
      : lower.includes('map') || lower.includes('route') || lower.includes('navig') ? 'navigation'
      : lower.includes('emergency') || lower.includes('police') || lower.includes('hospital') ? 'emergency'
      : 'general';

    const actionMap: Record<string, Array<{ label: string; href: string }>> = {
      wallet: [{ label: 'Open IbomPay Wallet', href: '/wallet' }, { label: 'AirSend Transfer', href: '/wallet/transfer' }],
      power: [{ label: 'Buy Power Token', href: '/power' }],
      flights: [{ label: 'Book Ibom Air Flight', href: '/flights' }],
      flood: [{ label: 'FloodSense Monitor', href: '/floodsense' }],
      kyc: [{ label: 'Complete KYC', href: '/kyc' }],
      market: [{ label: 'AgroConnect Market', href: '/market' }],
      navigation: [{ label: 'Open Map', href: '/map' }],
      emergency: [{ label: 'Emergency Services', href: '/health' }, { label: 'Report Issue', href: '/report' }],
      general: [{ label: 'Explore All Services', href: '/dashboard' }],
    };

    return {
      response: text,
      suggestedActions: actionMap[category] || actionMap.general,
      category,
    };
  } catch (error) {
    console.error('[Dara AI] Error:', error);
    return {
      response: "Emedi! I had a little hiccup there. Please try again — I'm right here with you! 💜",
      category: 'general',
      suggestedActions: [{ label: 'Go to Dashboard', href: '/dashboard' }],
    };
  }
}
