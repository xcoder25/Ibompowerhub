'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI assistant that helps with waste management services.
 *
 * @interface WasteServiceInput - The input type for the waste service flow.
 * @interface WasteServiceOutput - The output type for the waste service flow.
 * @function getWasteServiceResponse - The exported function to trigger the waste service flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WasteServiceInputSchema = z.object({
  serviceType: z.enum(['pickup', 'schedule', 'recycling', 'complaint']).describe("The type of waste service requested."),
  details: z.string().describe("Details about the user's request, e.g., location, type of waste, etc."),
});
export type WasteServiceInput = z.infer<typeof WasteServiceInputSchema>;

const WasteServiceOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the user's waste service request."),
  nextSteps: z.array(z.string()).describe("Suggested next steps for the user."),
});
export type WasteServiceOutput = z.infer<typeof WasteServiceOutputSchema>;

export async function getWasteServiceResponse(input: WasteServiceInput): Promise<WasteServiceOutput> {
  return wasteServiceFlow(input);
}

const wasteServicePrompt = ai.definePrompt({
  name: 'wasteServicePrompt',
  input: {schema: WasteServiceInputSchema},
  output: {schema: WasteServiceOutputSchema},
  system: `You are a waste management assistant for PowerHub CRS.
  
  You can help with the following services:
  - 'pickup': Schedule a waste pickup.
  - 'schedule': Provide information on waste collection schedules.
  - 'recycling': Help users find nearby recycling centers.
  - 'complaint': Log a complaint about waste management issues.
  
  Based on the user's request, provide a helpful response and suggest the next steps.

  User Request:
  Service: {{serviceType}}
  Details: {{details}}`,
});

const wasteServiceFlow = ai.defineFlow(
  {
    name: 'wasteServiceFlow',
    inputSchema: WasteServiceInputSchema,
    outputSchema: WasteServiceOutputSchema,
  },
  async input => {
    const {output} = await wasteServicePrompt(input);
    return output!;
  }
);
