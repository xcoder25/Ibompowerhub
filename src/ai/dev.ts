import { config } from 'dotenv';
config();

import '@/ai/flows/neighborhood-status-tool.ts';
import '@/ai/flows/crs-assistant-flow.ts';
import '@/ai/flows/waste-service-flow.ts';
import '@/ai/flows/map-navigation-flow.ts';
import '@/ai/flows/agro-assistant-flow.ts';
import '@/ai/flows/sort-by-distance-flow.ts';
import '@/ai/flows/find-place-flow.ts';
import '@/app/cuda/dashboard/page.tsx';
