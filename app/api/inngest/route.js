import { deleteCouponOnExpiry, syncUserCreation, syncUserDeletion, syncUserUpdation } from '@/inngest/functions'
import { inngest } from '@/inngest/client'
import { serve } from 'inngest/next'

// Create an API route that serves Inngest functions.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    deleteCouponOnExpiry,
  ],
})
