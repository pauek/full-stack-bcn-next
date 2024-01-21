import { db } from "@/lib/data/db/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

await migrate(db, { migrationsFolder: "drizzle" });
