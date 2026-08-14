import { Inngest } from 'inngest'
import { serve } from 'inngest/next'

const inngest = new Inngest({ id: 'justpets' })
//create an Api that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /**my functions will be passed here */
  ],
})
