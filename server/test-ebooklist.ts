import "dotenv/config";
import { ebookService } from "./services/ebook.service.js";

async function run() {
  const adminRes = await ebookService.listAllEbooks({ page: 1, limit: 10 });
  console.log("Admin Books:", adminRes.data);
  process.exit(0);
}
run();
