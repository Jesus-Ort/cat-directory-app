import { z } from 'zod'

export const breedSchema = z.object({
    breed: z.string(),
    country: z.string(),
    origin: z.string(),
    coat: z.string(),
    pattern: z.string(),
})

export const breedsResponseSchema = z.object({
    current_page: z.number(),
    data: z.array(breedSchema),
    first_page_url: z.string(),
    from: z.number(),
    last_page: z.number(),
    last_page_url: z.string(),
    next_page_url: z.string().nullable(),
    path: z.string(),
    per_page: z.number(),
    prev_page_url: z.string().nullable(),
    to: z.number(),
    total: z.number(),
})

export const factSchema = z.object({
    fact: z.string(),
    length: z.number(),
})

export type Breed = z.infer<typeof breedSchema>

export type BreedsResponse = z.infer<typeof breedsResponseSchema>

export type Fact = z.infer<typeof factSchema>