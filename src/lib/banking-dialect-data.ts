// ─── Banking Dialect Data ─────────────────────────────────────────────────────
// Linguistic training dataset for the Dialect-Aware Voice Banking Agent "Orion"
// Covers: Ibibio / Annang / Efik • Nigerian Pidgin • Nigerian Street Slang

// ─── Ibibio/Annang Financial Numbers ─────────────────────────────────────────
export const IBIBIO_NUMBERS: Record<string, number> = {
    'kiet': 1,
    'iba': 2,
    'ita': 3,
    'inaang': 4,
    'ition': 5,
    'itiokiet': 6,
    'itiaba': 7,
    'itiaita': 8,
    'usukkiet': 9,
    'duop': 10,
    'duop kiet': 11,
    'duop iba': 12,
    'duop ita': 13,
    'duop ition': 15,
    'duop duop': 20,
    'ikim': 100,
    'ikim ition': 500,
    'ikimi': 1000,
    'tossin': 1000,
    'tosin': 1000,
    'milyon': 1000000,
    'million': 1000000,
    'ikimi ition': 5000,
    'tosin ition': 5000,
    'ikimi duop': 10000,
    'tosin duop': 10000,
    'ikimi duop duop': 20000,
    'tosin duop duop': 20000,
    'ikimi ikim': 100000,
};

// ─── Ibibio/Annang/Efik Banking Vocabulary ───────────────────────────────────
export interface BankingDialectEntry {
    ibibio: string;
    english: string;
    category: 'action' | 'affirmation' | 'denial' | 'query' | 'security' | 'greeting' | 'currency';
    tones?: string;
    aliases?: string[];
}

export const IBIBIO_BANKING_VOCAB: BankingDialectEntry[] = [
    // Actions
    { ibibio: 'no okuk', english: 'send money / transfer', category: 'action', tones: 'L H-L', aliases: ['no owo', 'kpeme owo', 'kpeme okuk', 'no iko', 'nso okuk'] },
    { ibibio: 'sio okuk', english: 'withdraw money', category: 'action', tones: 'L H-L', aliases: ['sio owo', 'take out money'] },
    { ibibio: 'dok okuk', english: 'deposit / add money', category: 'action', tones: 'L H-L', aliases: ['dok owo', 'add money', 'fund account'] },
    { ibibio: 'nse okuk mi', english: 'check my balance', category: 'query', tones: 'L H-L H', aliases: ['nse owo mi', 'how much i have', 'balance mi'] },
    { ibibio: 'kpeme kadi mi', english: 'freeze / lock my card', category: 'security', tones: 'L H-L H', aliases: ['kpeme card', 'lock kadi', 'block my card', 'kpeme'] },
    { ibibio: 'kpe mbuk', english: 'pay bill', category: 'action', tones: 'L L', aliases: ['pay bill', 'kpe bills'] },
    { ibibio: 'nse akpa mi', english: 'show my history / transactions', category: 'query', tones: 'L H-L H', aliases: ['show history', 'my transactions', 'akpa mi'] },
    { ibibio: 'fi okuk', english: 'receive money', category: 'action', tones: 'L H-L', aliases: ['fi owo', 'receive okuk'] },

    // Affirmations
    { ibibio: 'ao', english: 'yes / go ahead / confirm', category: 'affirmation', tones: 'H', aliases: ['yak nnam', 'oya do am', 'proceed', 'ao nnam', 'ao ke'] },
    { ibibio: 'emesiere', english: 'let it be done / go ahead', category: 'affirmation', tones: 'H-H-L', aliases: ['proceed', 'let it go', 'do it now'] },
    { ibibio: 'sosong', english: 'thank you / accepted', category: 'affirmation', tones: 'H-L', aliases: ['sosongo'] },

    // Denials
    { ibibio: 'dodo', english: 'no / cancel', category: 'denial', tones: 'H-L', aliases: ['abort', 'stop it', 'cancel am', 'no do am'] },
    { ibibio: 'ukpok', english: 'stop / do not proceed', category: 'denial', tones: 'H-L', aliases: ['stop'] },

    // Greetings
    { ibibio: 'emedi', english: 'welcome / hello', category: 'greeting', tones: 'H-L', aliases: ['emedi orion', 'hello orion'] },
    { ibibio: 'idoho', english: 'well done / great', category: 'greeting', tones: 'H-L-H' },

    // Currency
    { ibibio: 'okuk', english: 'money / naira', category: 'currency', tones: 'H-L', aliases: ['owo', 'naira', 'cash', 'kobo'] },
    { ibibio: 'afia', english: 'business / transaction', category: 'currency', tones: 'H-L', aliases: ['transaction', 'business'] },
];

// ─── Nigerian Pidgin Banking Slang ───────────────────────────────────────────
export interface PidginEntry {
    pidgin: string;
    english: string;
    category: 'amount' | 'action' | 'affirmation' | 'denial' | 'query' | 'greeting';
}

export const PIDGIN_BANKING_VOCAB: PidginEntry[] = [
    { pidgin: '5k', english: '5000', category: 'amount' },
    { pidgin: '10k', english: '10000', category: 'amount' },
    { pidgin: '20k', english: '20000', category: 'amount' },
    { pidgin: '50k', english: '50000', category: 'amount' },
    { pidgin: '100k', english: '100000', category: 'amount' },
    { pidgin: '200k', english: '200000', category: 'amount' },
    { pidgin: '500k', english: '500000', category: 'amount' },
    { pidgin: '1 mil', english: '1000000', category: 'amount' },
    { pidgin: '2 mil', english: '2000000', category: 'amount' },
    { pidgin: '2 meter', english: '2000000', category: 'amount' },
    { pidgin: '1 meter', english: '1000000', category: 'amount' },
    { pidgin: '5 grand', english: '5000', category: 'amount' },
    { pidgin: '10 grand', english: '10000', category: 'amount' },
    { pidgin: '5 guas', english: '5000', category: 'amount' },
    { pidgin: '10 guas', english: '10000', category: 'amount' },
    { pidgin: 'racks', english: '1000', category: 'amount' },
    { pidgin: 'send am give', english: 'transfer to recipient', category: 'action' },
    { pidgin: 'chook am enter', english: 'deposit / add money', category: 'action' },
    { pidgin: 'transfer am', english: 'transfer', category: 'action' },
    { pidgin: 'check my aza', english: 'check balance', category: 'query' },
    { pidgin: 'how much for my account', english: 'check balance', category: 'query' },
    { pidgin: 'how much i get', english: 'check balance', category: 'query' },
    { pidgin: 'abeg check my money', english: 'check balance', category: 'query' },
    { pidgin: 'show my logs', english: 'show transactions', category: 'query' },
    { pidgin: 'lock my card sharp sharp', english: 'freeze card immediately', category: 'action' },
    { pidgin: 'block my card', english: 'freeze card', category: 'action' },
    { pidgin: 'oya fire am', english: 'yes, proceed', category: 'affirmation' },
    { pidgin: 'do am now', english: 'proceed immediately', category: 'affirmation' },
    { pidgin: 'e correct', english: 'confirmed / correct', category: 'affirmation' },
    { pidgin: 'no wahala', english: 'no problem / confirmed', category: 'affirmation' },
    { pidgin: 'i confirm am', english: 'confirmed', category: 'affirmation' },
    { pidgin: 'abeg cancel am', english: 'cancel', category: 'denial' },
    { pidgin: 'no do am', english: 'cancel', category: 'denial' },
    { pidgin: 'joor forget am', english: 'cancel', category: 'denial' },
    { pidgin: 'e no correct', english: 'that is wrong, cancel', category: 'denial' },
    { pidgin: 'oga orion', english: 'hey orion / hello', category: 'greeting' },
    { pidgin: 'boss orion', english: 'hello orion', category: 'greeting' },
    { pidgin: 'chairman', english: 'greeting honorific', category: 'greeting' },
    { pidgin: 'my guy', english: 'greeting', category: 'greeting' },
];

// ─── Akwa Ibom Common Names ───────────────────────────────────────────────────
export const AKWA_IBOM_NAMES: string[] = [
    'Bassey', 'Emem', 'Edidiong', 'Udeme', 'Kufre', 'Nsikak', 'Utibe', 'Ini',
    'Eno', 'Ubong', 'Idara', 'Imaobong', 'Ekanem', 'Atim', 'Edem', 'Uduak',
    'Eseme', 'Aniekan', 'Mfonobong', 'Etim', 'Okon', 'Iniubong', 'Etiowo',
    'Ntiense', 'Nkoyo', 'Abasifreke', 'Effiong', 'Okim', 'Unwana', 'Anietie',
    'Nse', 'Ekpenyong', 'Umoette', 'Affiong', 'Idorenyin',
    'Chinyere', 'Chioma', 'Amina', 'Fatima', 'Segun', 'Tunde', 'Ahmed',
    'Wale', 'Emeka', 'Ngozi', 'Ada', 'Musa', 'Ibrahim', 'Hauwa',
];

// ─── Nigerian Banks & Fintechs ───────────────────────────────────────────────
export const NIGERIAN_BANKS: { name: string; aliases: string[] }[] = [
    { name: 'GTBank', aliases: ['gtb', 'guaranty trust', 'guaranty', 'gt bank'] },
    { name: 'Access Bank', aliases: ['access', 'access bank', 'access diamond'] },
    { name: 'Zenith Bank', aliases: ['zenith', 'zenith bank'] },
    { name: 'UBA', aliases: ['uba', 'united bank for africa', 'united bank'] },
    { name: 'First Bank', aliases: ['first bank', 'firstbank', 'fbn', 'first'] },
    { name: 'Fidelity Bank', aliases: ['fidelity'] },
    { name: 'Union Bank', aliases: ['union bank', 'union'] },
    { name: 'Sterling Bank', aliases: ['sterling'] },
    { name: 'OPay', aliases: ['opay', 'o pay', 'opera pay'] },
    { name: 'Moniepoint', aliases: ['moniepoint', 'monie point', 'teamapt'] },
    { name: 'PalmPay', aliases: ['palmpay', 'palm pay'] },
    { name: 'Kuda', aliases: ['kuda bank', 'kuda'] },
    { name: 'Carbon', aliases: ['carbon', 'one credit'] },
    { name: 'Flutterwave', aliases: ['flutterwave', 'flutter wave', 'flw'] },
    { name: 'Paystack', aliases: ['paystack', 'pay stack'] },
];

// ─── Utility Bill Types ───────────────────────────────────────────────────────
export const UTILITY_BILL_TYPES: { type: string; aliases: string[] }[] = [
    { type: 'airtime', aliases: ['airtime', 'recharge', 'buy credit', 'top up phone', 'load credit'] },
    { type: 'data', aliases: ['data', 'buy data', 'data plan', 'internet', 'browse'] },
    { type: 'electricity', aliases: ['electricity', 'nepa', 'phcn', 'iedc', 'aedc', 'light bill', 'power token', 'prepaid token'] },
    { type: 'cable_tv', aliases: ['dstv', 'gotv', 'showmax', 'cable', 'tv subscription'] },
    { type: 'water', aliases: ['water bill', 'akwa ibom water'] },
];

// ─── Phonetic Map: Ibibio diacritics → Browser TTS readable ─────────────────
export const IBIBIO_PHONETIC_MAP: Record<string, string> = {
    '\u1ECD': 'oh',   // ọ
    '\u1ECB': 'ee',   // ị
    '\u00F1': 'ny',   // ñ
    '\u01F9': 'ng',   // ǹ
    '\u1EB9': 'eh',   // ẹ
    '\u1ECC': 'Oh',   // Ọ
    '\u1ECA': 'Ee',   // Ị
    '\u00D1': 'Ny',   // Ñ
};

export function toPhonetic(text: string): string {
    let result = text;
    for (const [char, replacement] of Object.entries(IBIBIO_PHONETIC_MAP)) {
        result = result.replaceAll(char, replacement);
    }
    return result;
}

export function parseIbibioNumber(phrase: string): number | null {
    const lower = phrase.toLowerCase().trim()
        .replace(/t\u1ECD\u1E63\u1ECBn/g, 'tosin')
        .replace(/mily\u1ECDn/g, 'milyon');
    if (IBIBIO_NUMBERS[lower] !== undefined) return IBIBIO_NUMBERS[lower];
    const tosinMatch = lower.match(/^(\d+)\s*tosin$/);
    if (tosinMatch) return parseInt(tosinMatch[1]) * 1000;
    const milyonMatch = lower.match(/^(\d+)\s*milyon$/);
    if (milyonMatch) return parseInt(milyonMatch[1]) * 1000000;
    return null;
}

export function parsePidginAmount(text: string): number | null {
    const lower = text.toLowerCase().trim();
    const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*k\b/);
    if (kMatch) return parseFloat(kMatch[1]) * 1000;
    const meterMatch = lower.match(/(\d+(?:\.\d+)?)\s*meter/);
    if (meterMatch) return parseFloat(meterMatch[1]) * 1000000;
    const milMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:mil\b|million)/);
    if (milMatch) return parseFloat(milMatch[1]) * 1000000;
    const grandMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:grand|guas|bucks)/);
    if (grandMatch) return parseFloat(grandMatch[1]) * 1000;
    const racksMatch = lower.match(/(\d+(?:\.\d+)?)\s*racks/);
    if (racksMatch) return parseFloat(racksMatch[1]) * 1000;
    return null;
}

export function resolveBankName(spoken: string): string | null {
    const lower = spoken.toLowerCase();
    for (const bank of NIGERIAN_BANKS) {
        if (bank.aliases.some(alias => lower.includes(alias))) return bank.name;
        if (lower.includes(bank.name.toLowerCase())) return bank.name;
    }
    return null;
}

export function detectDialect(transcript: string): 'ibibio' | 'pidgin' | 'english' | 'code-switching' {
    const lower = transcript.toLowerCase();
    const ibibioKeywords = ['no okuk', 'okuk', 'owo', 'kpeme', 'dok', 'ao nnam', 'emedi', 'sosong', 'ikimi', 'tosin', 'tossin', 'duop', 'kiet', 'ikim', 'sio', 'fi okuk', 'nse okuk'];
    const pidginKeywords = ['abeg', 'no wahala', 'oya', 'sharp sharp', 'my guy', 'chook am', 'aza', 'nna', 'oga', 'e dey', 'e correct', 'wahala', 'guas', 'racks'];
    const ibibioScore = ibibioKeywords.filter(k => lower.includes(k)).length;
    const pidginScore = pidginKeywords.filter(k => lower.includes(k)).length;
    const formalScore = ['transfer', 'please', 'balance', 'account', 'transaction'].filter(k => lower.includes(k)).length;
    const total = ibibioScore + pidginScore + formalScore;
    if (total === 0) return 'english';
    if (ibibioScore > pidginScore && ibibioScore > formalScore) return 'ibibio';
    if (pidginScore > ibibioScore && pidginScore >= formalScore) return 'pidgin';
    if (ibibioScore > 0 || pidginScore > 0) return 'code-switching';
    return 'english';
}

export function getIbibioTerm(englishAction: string): string | null {
    const entry = IBIBIO_BANKING_VOCAB.find(v =>
        v.english.toLowerCase().includes(englishAction.toLowerCase()) ||
        (v.aliases ?? []).some(a => a.toLowerCase().includes(englishAction.toLowerCase()))
    );
    return entry?.ibibio ?? null;
}
