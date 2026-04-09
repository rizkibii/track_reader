import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function promoteToAdmin() {
  const email = "muhamad.rizkifajri@gmail.com";
  try {
    const result = await sql`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = ${email} 
      RETURNING name, email, role
    `;
    
    if (result.length > 0) {
      console.log("✅ Berhasil mengubah akun menjadi Admin:", result[0]);
    } else {
      console.log("❌ Email tidak ditemukan di database.");
    }
  } catch (error: any) {
    console.error("❌ Terjadi error:", error.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

promoteToAdmin();
