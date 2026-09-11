import { deleteCouponOnExpiry, syncUserCreation, syncUserDeletion, syncUserUpdation } from '@/inngest/functions'
import { inngest } from '@/inngest/client'
import { serve } from 'inngest/next'

// API endpoint where Inngest invokes background functions such as user sync and coupon expiry.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    deleteCouponOnExpiry,
  ],
})
