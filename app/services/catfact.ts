import type { BreedsResponse, Fact, Breed } from '~/types/catfact'

import { breedsResponseSchema, factSchema } from '~/types/catfact'

import { withRetry } from '~/utils/retry'

const API_URL = 'https://catfact.ninja'

export async function getBreeds(
    page = 1,
    ): Promise<BreedsResponse> {
    return withRetry(async () => {
        const response = await $fetch(`${API_URL}/breeds`, {
        query: {
            page,
        },
        })

        return breedsResponseSchema.parse(response)
    })
}

export async function getRandomFact(): Promise<Fact> {
    return withRetry(async () => {
        const response = await $fetch(`${API_URL}/fact`)

        return factSchema.parse(response)
    })
}
