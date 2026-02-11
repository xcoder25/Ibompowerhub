"use server";

import { revalidatePath } from "next/cache";

export async function schedulePickupAction(formData: FormData) {
  // 1. Extract data from the form
  const data = {
    name: formData.get("fullName"),
    address: formData.get("address"),
    wasteType: formData.get("wasteType"),
    date: formData.get("pickupDate"),
    phone: formData.get("phone"),
  };

  // 2. Logic: This is where you'd call your DB (Supabase, Prisma, etc.)
  console.log("Saving pickup to database:", data);

  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 3. Refresh the page data without a full reload
  revalidatePath("/waste-management");

  return { success: true, message: "Pickup scheduled for " + data.date };
}
