'use server';

/**
 * @fileOverview This file defines a Genkit flow for sorting a list of artisans by their distance from a user.
 *
 * It uses a simple haversine distance calculation and does not require an LLM.
 *
 * @interface SortArtisansInput - The input type for the sorting flow.
 * @interface SortArtisansOutput - The output type for the sorting flow.
 * @function sortArtisansByDistance - The exported function to trigger the sorting flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { artisans as initialArtisans } from '@/lib/data';

// Define the schema for a single artisan
const ArtisanSchema = z.object({
  id: z.number(),
  name: z.string(),
  skill: z.string(),
  rating: z.number(),
  distance: z.string(), // e.g., "1.5km"
  imageId: z.string(),
  hourlyRate: z.string(),
  availability: z.string(),
  // Adding mock coordinates for sorting
  coords: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});
type Artisan = z.infer<typeof ArtisanSchema>;

const SortArtisansInputSchema = z.object({
  userLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  artisans: z.array(ArtisanSchema).describe("An array of artisan objects to be sorted."),
});
export type SortArtisansInput = z.infer<typeof SortArtisansInputSchema>;

const SortArtisansOutputSchema = z.object({
  sortedArtisans: z.array(ArtisanSchema),
});
export type SortArtisansOutput = z.infer<typeof SortArtisansOutputSchema>;


/**
 * Calculates the Haversine distance between two points on the earth.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance in kilometers.
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


// Exported function that calls the Genkit flow
export async function sortArtisansByDistance(input: SortArtisansInput): Promise<SortArtisansOutput> {
  return sortByDistanceFlow(input);
}


// Define the Genkit flow for sorting
const sortByDistanceFlow = ai.defineFlow(
  {
    name: 'sortByDistanceFlow',
    inputSchema: SortArtisansInputSchema,
    outputSchema: SortArtisansOutputSchema,
  },
  async ({ userLocation, artisans }) => {
    const sorted = [...artisans].sort((a, b) => {
      const distA = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.coords.latitude,
        a.coords.longitude
      );
      const distB = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.coords.latitude,
        b.coords.longitude
      );
      return distA - distB;
    });

    // Update the 'distance' string for display
    const updatedSortedArtisans = sorted.map(artisan => {
        const dist = getDistance(
            userLocation.latitude,
            userLocation.longitude,
            artisan.coords.latitude,
            artisan.coords.longitude
        );
        return {
            ...artisan,
            distance: `${dist.toFixed(1)}km`
        }
    })

    return {
      sortedArtisans: updatedSortedArtisans,
    };
  }
);
