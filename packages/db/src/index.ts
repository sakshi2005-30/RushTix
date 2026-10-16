import {PrismaPg} from "@prisma/adapter-pg"
import {PrismaClient} from "../generated/prisma/client.js"
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({
  path: path.resolve(process.cwd(), "../../packages/db/.env"),
});
console.log("DATABASE_URL loaded:", Boolean(process.env.DATABASE_URL));
const adapter=new PrismaPg({
    connectionString:process.env.DATABASE_URL!,
     max: 10,
    connectionTimeoutMillis: 10000,
})
const prisma=new PrismaClient({adapter})
export {prisma}