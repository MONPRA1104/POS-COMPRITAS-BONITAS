import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.rtiahzgxnjnsfqpspxfd:Cronos1al7%24%24@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
});
async function main() {
  console.log("Connecting...");
  const users = await prisma.user.findMany();
  console.log("Connected! Users:", users.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
