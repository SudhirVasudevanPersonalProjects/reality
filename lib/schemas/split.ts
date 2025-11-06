import { z } from 'zod'

export const splitRequestSchema = z.object({
  splits: z.array(
    z.object({
      text_content: z.string().min(1, 'Text content cannot be empty'),
      media_urls: z.array(z.string().url()).optional(),
    })
  ).min(1, 'At least one split is required'),
})

export type SplitRequestInput = z.infer<typeof splitRequestSchema>
