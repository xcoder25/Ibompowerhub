
'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI assistant that helps find products in the AgroConnect Market.
 * @interface AgroAssistantInput - The input type for the assistant flow.
 * @interface AgroAssistantOutput - The output type for the assistant flow.
 * @function findProduct - The exported function to trigger the product finding flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AgroAssistantInputSchema = z.object({
  query: z.string().describe("The product the user is looking for, e.g., 'fresh crayfish' or 'garri'."),
  availableSellers: z.string().describe("A JSON string of all available sellers and their products."),
});
export type AgroAssistantInput = z.infer<typeof AgroAssistantInputSchema>;

const FoundSellerSchema = z.object({
  id: z.number().describe("The unique ID of the seller."),
  name: z.string().describe("The name of the seller."),
});

const AgroAssistantOutputSchema = z.object({
  foundSellers: z.array(FoundSellerSchema).describe("An array of sellers that have the requested product."),
});
export type AgroAssistantOutput = z.infer<typeof AgroAssistantOutputSchema>;

export async function findProduct(input: AgroAssistantInput): Promise<AgroAssistantOutput> {
  return agroAssistantFlow(input);
}

const agroAssistantPrompt = ai.definePrompt({
  name: 'agroAssistantPrompt',
  input: { schema: AgroAssistantInputSchema },
  output: { schema: AgroAssistantOutputSchema },
  system: `You are an AI assistant for the AgroConnect Market. Your job is to help users find products.

You will be given a user's query and a JSON string representing all available sellers. Each seller has a list of products.

Analyze the user's query to understand what product they want. Then, search the 'products' array of each seller in the provided JSON to see if it contains the requested product or a very close synonym.

Return an array of seller objects (only including 'id' and 'name') for every seller that stocks the item. If the user asks for 'fish', you should also match 'crayfish', 'tilapia', etc. If no sellers are found, return an empty array.

User Query: "{{query}}"

Available Sellers (JSON):
\`\`\`json
{{availableSellers}}
\`\`\`
`,
});

const agroAssistantFlow = ai.defineFlow(
  {
    name: 'agroAssistantFlow',
    inputSchema: AgroAssistantInputSchema,
    outputSchema: AgroAssistantOutputSchema,
  },
  async input => {
    const { output } = await agroAssistantPrompt(input);
    return output!;
  }
);
