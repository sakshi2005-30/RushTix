import {PrismaPg} from "@prisma/adapter-pg"
import {PrismaClient} from "../generated/prisma/client.js"
import "dotenv/config"
const adapter=new PrismaPg({
    connectionString:process.env.DATABASE_URL!
})
const prisma=new PrismaClient({adapter})
export {prisma}