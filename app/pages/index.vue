<template>
    <main class="mx-auto max-w-5xl p-6">
        <h1 class="mb-6 text-center text-3xl font-bold">
        Michiario - Diccionario de Razas de michis 🐱
        </h1>

        <div class="mb-6">
            <label for="breed-search" class="mb-2 block font-medium">
                Buscar raza o país
            </label>

            <UInput
                id="breed-search"
                v-model="searchInput"
                placeholder="Ej. Siamese, Egypt..."
                class="w-full"
                aria-label="Buscar razas por nombre o país"
            />
        </div>


        <div v-if="loading" role="status" aria-live="polite">
            Cargando razas...
        </div>

        <div v-else-if="error" role="alert">
            No se pudieron cargar las razas.
            Intenta recargar la página.
        </div>

        <div v-else>
            <p class="mb-4 text-sm text-gray-500" aria-live="polite">
                {{ filteredBreeds.length }} resultados
            </p>

            <ul class="space-y-3">
                <li
                v-for="breed in filteredBreeds"
                :key="`${breed.breed}-${breed.country}`"
                class="rounded-lg border p-4"
                >
                <h2 class="font-semibold">
                    {{ breed.breed }}
                </h2>

                <p class="text-sm text-gray-500">
                    País: {{ breed.country }}
                </p>
                </li>
            </ul>

            <p
                v-if="filteredBreeds.length === 0"
                class="py-8 text-center text-gray-500"
            >
                No se encontraron razas que coincidan con la búsqueda.
            </p>
        </div>
    </main>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBreedsStore } from '~/stores/breeds'

const route = useRoute()
const router = useRouter()
const breedsStore = useBreedsStore()

await callOnce('breeds-initial', () => {
    return breedsStore.loadInitial()
})

const { breeds, loading, error } = storeToRefs(breedsStore)

function getSearchQuery(value: unknown): string {
    return typeof value === 'string' ? value : ''
}

const searchInput = ref(getSearchQuery(route.query.search))


const filteredBreeds = computed(() => {
    const query = searchInput.value.trim().toLocaleLowerCase()

    if (!query) {
        return breeds.value
    }

    return breeds.value.filter((breed) => {
        return (
        breed.breed.toLocaleLowerCase().includes(query) ||
        breed.country.toLocaleLowerCase().includes(query)
        )
    })
})


let debounceTimer: ReturnType<typeof setTimeout> | undefined

watch(searchInput, (value) => {
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
        const search = value.trim()

        router.replace({
        query: {
            ...route.query,
            search: search || undefined,
        },
        })
    }, 300)
})


watch(
    () => route.query.search,
    (value) => {
        const search = getSearchQuery(value)

        if (search !== searchInput.value) {
        searchInput.value = search
        }
    },
)

onBeforeUnmount(() => {
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
})
</script>