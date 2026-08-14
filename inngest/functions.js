// src/inngest/functions.ts
import { inngest } from "./client";
import prisma from '@/lib/prisma'

// inngest functions to save user to database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create"}, 
     { event: "clerk/user.created" } ,
  async ({ event }) => {
   const {data} = event

    await prisma.user.create ({ 
        data: {
            id: data.id,
            email: data.email.addresses[0].email_address,
            name: `${data.first_name} ${data.last_name}`,
            image: data.image_url,
        }
       }) 
  }
);

// inngest function to update user data in database

export const syncUserUpdation = inngest.createFunction({
    id: 'sync-user-update'},
    {event: 'Clerk/user.update'},
    async ({event}) =>
        await prisma.user.update({
            where: {id: data.id,},
        data: {
            
            email: data.email.addresses[0].email_address,
            name: `${data.first_name} ${data.last_name}`,
            image: data.image_url,
        }
        })

)