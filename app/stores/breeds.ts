import { defineStore } from 'pinia'
import type { Breed } from '~/types/catfact'
import { getBreeds } from '~/services/catfact'

export const useBreedsStore = defineStore('breeds', () => {
    const breeds = ref<Breed[]>([])
    const currentPage = ref(0)
    const lastPage = ref(1)

    const loadingPages = ref(new Set<number>())
    const loading = ref(false)
    const loadingMore = ref(false)
    const error = ref<unknown>(null)

    const hasMore = computed(() => {
        return currentPage.value < lastPage.value
    })

    async function loadInitial() {
        loading.value = true
        error.value = null

        try {
        const response = await getBreeds(1)

        breeds.value = response.data
        currentPage.value = response.current_page
        lastPage.value = response.last_page
        } catch (err) {
        error.value = err
        } finally {
        loading.value = false
        }
    }

    async function loadMore() {
    if (
        loadingMore.value ||
        loading.value ||
        !hasMore.value
    ) {
        return
    }

    const nextPage = currentPage.value + 1

    if (loadingPages.value.has(nextPage)) {
        return
    }

    loadingPages.value.add(nextPage)
    loadingMore.value = true
    error.value = null

    try {
        const response = await getBreeds(nextPage)

        breeds.value.push(...response.data)

        currentPage.value = response.current_page
        lastPage.value = response.last_page
    } catch (err) {
        error.value = err
    } finally {
        loadingPages.value.delete(nextPage)
        loadingMore.value = false
    }
    }

    async function refresh() {
        breeds.value = []
        currentPage.value = 0
        lastPage.value = 1

        await loadInitial()
    }

    async function findBreed(name: string): Promise<Breed | null> {
        const normalizedName = name.trim().toLocaleLowerCase()

        const existingBreed = breeds.value.find(
            (breed) =>
            breed.breed.toLocaleLowerCase() === normalizedName,
        )

        if (existingBreed) {
            return existingBreed
        }

        let page = currentPage.value || 1

        while (page <= lastPage.value) {
            const response = await getBreeds(page)

            const breed = response.data.find(
            (item) =>
                item.breed.toLocaleLowerCase() === normalizedName,
            )

            if (breed) {
            return breed
            }

            if (page >= response.last_page) {
            break
            }

            page++
        }

        return null
    }

    return {
        breeds,
        currentPage,
        lastPage,
        loading,
        loadingMore,
        error,
        hasMore,
        loadInitial,
        loadMore,
        refresh,
        findBreed
    }
})