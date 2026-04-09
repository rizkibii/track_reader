import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function checkEbooks() {
  try {
    const list = await sql`SELECT * FROM ebooks`;
    console.log("Books in DB:", list);
  } catch(e: any) {
    console.error("Error:", e.message);
  } finally {
    process.exit(0);
  }
}
checkEbooks();
