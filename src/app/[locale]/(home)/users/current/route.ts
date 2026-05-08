import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server"

import { db } from "@/db";
import { users } from "@/db/schema";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }
  
  const [existingUser] = await db
  .select()
  .from(users)
  .where(eq(users.clerkId, userId));
  
  if (!existingUser) {
    return redirect("/sign-in");
  }

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab");

  if (tab) {
    return redirect(`/users/${existingUser.id}?tab=${tab}`);
  }

  return redirect(`/users/${existingUser.id}`);
};
