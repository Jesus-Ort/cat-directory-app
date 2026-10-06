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

export async function getBreedByName(
    name: string,
    ): Promise<Breed | null> {
    let page = 1
    let lastPage = 1

    while (page <= lastPage) {
        const response = await getBreeds(page)

        const breed = response.data.find(
        (item) =>
            item.breed.toLocaleLowerCase() ===
            name.toLocaleLowerCase(),
        )

        if (breed) {
        return breed
        }

        lastPage = response.last_page
        page++
    }

    return null
}