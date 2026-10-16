import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

/** Permanently removes app data and the Better Auth identity for the signed-in user. */
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((confirmed: boolean) => confirmed)
  .handler(async ({ context, data: confirmed }) => {
    if (!confirmed) throw new Error("La eliminación no fue confirmada");
    const sql = await getSql();
    const userId = context.userId;
    // Keep the statements parameterized and ordered so both the Neon and
    // embedded PGLite adapters support the same account-deletion flow.
    await sql`delete from body_logs where user_id = ${userId}`;
    await sql`delete from training_plans where user_id = ${userId}`;
    await sql`delete from workouts where user_id = ${userId}`;
    await sql`delete from profiles where user_id = ${userId}`;
    await sql`delete from account where user_id = ${userId}`;
    await sql`delete from session where user_id = ${userId}`;
    await sql`delete from verification where identifier = ${userId}`;
    await sql`delete from "user" where id = ${userId}`;
    return { deleted: true };
  });
