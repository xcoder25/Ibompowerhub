
'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI assistant that is an expert on the PowerHub CRS application.
 *
 * @interface CrsAssistantInput - The input type for the CRS assistant flow.
 * @interface CrsAssistantOutput - The output type for the CRS assistant flow.
 * @function getCrsAssistantResponse - The exported function to trigger the CRS assistant flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrsAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about the PowerHub CRS application."),
});
export type CrsAssistantInput = z.infer<typeof CrsAssistantInputSchema>;

const CrsAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user's query."),
});
export type CrsAssistantOutput = z.infer<typeof CrsAssistantOutputSchema>;

export async function getCrsAssistantResponse(input: CrsAssistantInput): Promise<CrsAssistantOutput> {
  return crsAssistantFlow(input);
}

const crsAssistantPrompt = ai.definePrompt({
  name: 'crsAssistantPrompt',
  input: {schema: CrsAssistantInputSchema},
  output: {schema: CrsAssistantOutputSchema},
  system: `You are an expert AI assistant for the "PowerHub CRS" application. Your purpose is to provide helpful, clear, and concise answers to user questions about the app's features and how to use them.

You have complete knowledge of all features within PowerHub CRS, including:

- **Dashboard**: The user's personalized home page with a snapshot of community activity, quick actions, and recent reports.
- **Map View**: A live map showing real-time community alerts and reports.
- **Services**: A directory of all available services in the app.
- **AgroConnect Market**: A marketplace for users to buy fresh produce directly from local farmers. Users can browse sellers, see their products, and get contact information.
- **SkillsHub**: A platform to find and hire trusted local artisans like electricians, plumbers, and carpenters. Users can view their skills, ratings, and request quotes.
- **Transport Guide**: A tool to estimate fares for local routes and view a reference of standard fares for popular trips.
- **Community Alerts**: A live feed of reports from the community (e.g., power outages, flooding, waste overflow). Users can upvote to confirm issues and see the status of reports.
- **Profile**: Where users can view their activity, manage their provider listings, and edit their personal information.
- **AI Assistant**: That's you! An AI-powered guide to help users navigate the app.

When responding to a user's query, be friendly and direct. Provide step-by-step instructions if a user asks how to do something.

User's Question:
{{query}}
`,
});

const crsAssistantFlow = ai.defineFlow(
  {
    name: 'crsAssistantFlow',
    inputSchema: CrsAssistantInputSchema,
    outputSchema: CrsAssistantOutputSchema,
  },
  async input => {
    const {output} = await crsAssistantPrompt(input);
    return output!;
  }
);
