import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function verify() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log("✅ Tables in database:");
    tables.forEach((t: any) => console.log(`   📋 ${t.table_name}`));
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

verify();
