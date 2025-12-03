'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating real-time neighborhood status updates.
 *
 * The flow takes in recent report summaries and outputs a summary of the neighborhood status.
 * @interface NeighborhoodStatusInput - The input type for the neighborhood status flow.
 * @interface NeighborhoodStatusOutput - The output type for the neighborhood status flow.
 * @function getNeighborhoodStatus - The exported function to trigger the neighborhood status flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NeighborhoodStatusInputSchema = z.object({
  reportSummaries: z
    .string()
    .describe("Summaries of recent reports in the neighborhood."),
});
export type NeighborhoodStatusInput = z.infer<typeof NeighborhoodStatusInputSchema>;

const NeighborhoodStatusOutputSchema = z.object({
  powerStatus: z.enum(['ON', 'OFF', 'UNKNOWN']).describe('The current power status in the neighborhood.'),
  floodRisk: z.enum(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']).describe('The current flood risk in the neighborhood.'),
  wasteOverflow: z.enum(['NO', 'YES', 'UNKNOWN']).describe('Whether there is waste overflow in the neighborhood.'),
  overallStatus: z.string().describe('A short summary of the overall neighborhood status.'),
});
export type NeighborhoodStatusOutput = z.infer<typeof NeighborhoodStatusOutputSchema>;

export async function getNeighborhoodStatus(input: NeighborhoodStatusInput): Promise<NeighborhoodStatusOutput> {
  return neighborhoodStatusFlow(input);
}

const neighborhoodStatusPrompt = ai.definePrompt({
  name: 'neighborhoodStatusPrompt',
  input: {schema: NeighborhoodStatusInputSchema},
  output: {schema: NeighborhoodStatusOutputSchema},
  prompt: `You are an AI assistant providing real-time status updates for a neighborhood based on recent reports.

  Analyze the following report summaries and determine the current power status, flood risk, and waste overflow situation.
  Provide a short overall summary of the neighborhood status.

  Report Summaries:
  {{reportSummaries}}

  Ensure that your response matches the following schema:
  ${JSON.stringify(NeighborhoodStatusOutputSchema.shape, null, 2)}`,
});

const neighborhoodStatusFlow = ai.defineFlow(
  {
    name: 'neighborhoodStatusFlow',
    inputSchema: NeighborhoodStatusInputSchema,
    outputSchema: NeighborhoodStatusOutputSchema,
  },
  async input => {
    const {output} = await neighborhoodStatusPrompt(input);
    return output!;
  }
);
