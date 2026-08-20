import { inngest } from './client'
import { prisma } from '@/lib/prisma'


const getUserData = (data) => ({
  id: data.id,
  email: data.email_addresses?.[0]?.email_address ?? '',
  name: [data.first_name, data.last_name].filter(Boolean).join(' '),
  image: data.image_url ?? '',
})

// inngest functions to save user to database
export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-create', triggers: { event: 'clerk/user.created' } },
  async ({ event }) => {
    await prisma.user.create({
      data: getUserData(event.data),
    })
  }
)

// inngest function to update user data in database

export const syncUserUpdation = inngest.createFunction(
  { id: 'sync-user-update', triggers: { event: 'clerk/user.updated' } },
  async ({ event }) => {
    const data = getUserData(event.data)

    await prisma.user.update({
      where: { id: data.id },
      data,
    })
  }
)

// inngest function to delete user from database

export const syncUserDeletion = inngest.createFunction(
  { id: 'sync-user-delete', triggers: { event: 'clerk/user.deleted' } },
  async ({ event }) => {
    await prisma.user.delete({
      where: { id: event.data.id },
    })
  }
)
// inngest function to delete coupon on expiry
export const deleteCouponOnExpiry = inngest.createFunction(
  { id: 'delete-coupon-on-expiry', triggers: { event: 'app/coupon.expired' } },
  async ({ event, step }) => {
    const { data } = event
    const expiryDate = new Date(data.expiresAt)

    if (!data.code || Number.isNaN(expiryDate.getTime())) {
      throw new Error('Invalid coupon expiry event payload')
    }

    await step.sleepUntil('wait-for-expiry', expiryDate)

    await step.run('delete-coupon-from-database', async () => {
      await prisma.coupon.deleteMany({
        where: {
          code: data.code,
          expiresAt: {
            lte: new Date(),
          },
        },
      })
    })
  }
)
