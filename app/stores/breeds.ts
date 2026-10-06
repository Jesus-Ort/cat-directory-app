import { defineStore } from 'pinia'
import type { Breed } from '~/types/catfact'
import { getBreeds } from '~/services/catfact'

export const useBreedsStore = defineStore('breeds', () => {
    const breeds = ref<Breed[]>([])
    const currentPage = ref(0)
    const lastPage = ref(1)

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

        loadingMore.value = true
        error.value = null

        try {
        const nextPage = currentPage.value + 1

        const response = await getBreeds(nextPage)

        breeds.value.push(...response.data)

        currentPage.value = response.current_page
        lastPage.value = response.last_page
        } catch (err) {
        error.value = err
        } finally {
        loadingMore.value = false
        }
    }

    async function refresh() {
        breeds.value = []
        currentPage.value = 0
        lastPage.value = 1

        await loadInitial()
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
    }
})