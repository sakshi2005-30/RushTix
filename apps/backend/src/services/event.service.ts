import {prisma} from "@repo/db"
interface GetEventQuery{
    id?:string,
    search?:string,
    page:number,
    limit:number,
    venue:string
}
export const createEvent=async(data:{
    name:string,
    description:string,
    venue:string,
    date:Date
})=>{
    try{
        const {name,description,venue,date}=data;
        const event=await prisma.event.create({
            data:{
                name,
                description,
                venue,
                date:new Date(date)
            },
            select:{
                id:true,
                name:true,
                description:true,
                venue:true,
                date:true
            }
        })
        return event;
    }
    catch(error){
        throw error;
    }
}
export const getEvents=async(query:GetEventQuery)=>{
    try{
        const {id,search,page=1,limit=10,venue}=query;
        if(id){
            const event=await prisma.event.findUnique({
                where:{
                    id
                },
                select:{
                    id:true,
                    name:true,
                    description:true,
                    venue:true,
                    date:true
                }
            })
            if(!event){
                throw new Error("No event found with this id")
            }
            return event
        }
        const event=await prisma.event.findMany({
            where:{
                ...(search &&{
                    name:{contains:search,mode:"insensitive"}
                }),
                ...(venue &&{
                    venue:{contains:venue,mode:"insensitive"}
                })
            },
            orderBy:{
                date:"desc"
            },

            skip: (page - 1) * limit,
            take: limit,    
            
            select:{
                id:true,
                name:true,
                description:true,
                venue:true,
                date:true
            }
        })
        return event;
    }
    catch(error){
        throw error;
    }
}