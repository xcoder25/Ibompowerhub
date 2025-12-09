'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI navigation assistant.
 *
 * It understands natural language queries for directions and returns a structured
 * origin and destination.
 *
 * @interface MapNavigationInput - The input type for the navigation flow.
 * @interface MapNavigationOutput - The output type for the navigation flow.
 * @function getNavigationRoute - The exported function to trigger the navigation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MapNavigationInputSchema = z.object({
  query: z.string().describe("The user's natural language query for directions, e.g., 'directions from Watt Market to Tinapa'."),
});
export type MapNavigationInput = z.infer<typeof MapNavigationInputSchema>;

const MapNavigationOutputSchema = z.object({
  origin: z.string().describe("The starting point of the journey. This should be a specific, searchable location."),
  destination: z.string().describe("The final destination of the journey. This should be a specific, searchable location."),
});
export type MapNavigationOutput = z.infer<typeof MapNavigationOutputSchema>;

export async function getNavigationRoute(input: MapNavigationInput): Promise<MapNavigationOutput> {
  return mapNavigationFlow(input);
}

const mapNavigationPrompt = ai.definePrompt({
  name: 'mapNavigationPrompt',
  input: {schema: MapNavigationInputSchema},
  output: {schema: MapNavigationOutputSchema},
  system: `You are a navigation assistant for an app covering Cross River State, Nigeria. Your job is to parse a user's query and extract the origin and destination for a journey.

The user's query may be imprecise. Extract the most likely origin and destination based on their input. Both origin and destination should be real, recognizable places. If only a destination is provided, you can leave the origin as "My Current Location".

User's Query:
"{{query}}"

Extract the origin and destination from this query.
`,
});

const mapNavigationFlow = ai.defineFlow(
  {
    name: 'mapNavigationFlow',
    inputSchema: MapNavigationInputSchema,
    outputSchema: MapNavigationOutputSchema,
  },
  async input => {
    const {output} = await mapNavigationPrompt(input);
    return output!;
  }
);
