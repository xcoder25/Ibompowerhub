'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI assistant that finds places.
 *
 * It understands natural language queries for places and returns a structured
 * place type for use with Google Places API.
 *
 * @interface FindPlaceInput - The input type for the find place flow.
 * @interface FindPlaceOutput - The output type for the find place flow.
 * @function findPlace - The exported function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindPlaceInputSchema = z.object({
  query: z.string().describe("The user's natural language query for a place, e.g., 'find the nearest hospital' or 'show me supermarkets'."),
});
export type FindPlaceInput = z.infer<typeof FindPlaceInputSchema>;

const FindPlaceOutputSchema = z.object({
  placeType: z.string().describe("The type of place the user is looking for (e.g., 'hospital', 'bank', 'supermarket')."),
});
export type FindPlaceOutput = z.infer<typeof FindPlaceOutputSchema>;

export async function findPlace(input: FindPlaceInput): Promise<FindPlaceOutput> {
  return findPlaceFlow(input);
}

const findPlacePrompt = ai.definePrompt({
  name: 'findPlacePrompt',
  input: {schema: FindPlaceInputSchema},
  output: {schema: FindPlaceOutputSchema},
  system: `You are a place-finding assistant. Your job is to parse a user's query and extract the type of place they are looking for.

The user's query may be imprecise. Extract the most likely category of place. The output should be a simple, one-word category if possible.

User's Query:
"{{query}}"

Examples:
- User Query: "Find the nearest hospital" -> placeType: "hospital"
- User Query: "I need to go to the bank" -> placeType: "bank"
- User Query: "show me supermarkets" -> placeType: "supermarket"

Extract the place type from the query.
`,
});

const findPlaceFlow = ai.defineFlow(
  {
    name: 'findPlaceFlow',
    inputSchema: FindPlaceInputSchema,
    outputSchema: FindPlaceOutputSchema,
  },
  async input => {
    const {output} = await findPlacePrompt(input);
    return output!;
  }
);
