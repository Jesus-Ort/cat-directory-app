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

            <div
            ref="sentinel"
            class="h-10"
            aria-hidden="true"
            />

            <div
            v-if="loadingMore"
            role="status"
            aria-live="polite"
            class="py-4 text-center"
            >
            Cargando más razas...
            </div>

            <p
            v-if="!hasMore && breeds.length > 0"
            class="py-4 text-center text-gray-500"
            >
            Has llegado al final de la lista.
            </p>

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

const {
    breeds,
    loading,
    loadingMore,
    error,
    currentPage,
    hasMore,
} = storeToRefs(breedsStore)

const sentinel = ref<HTMLElement | null>(null)

function getTargetPage(value: unknown): number {
    const raw = Array.isArray(value) ? value[0] : value
    const page = Number(raw)

    if (!Number.isSafeInteger(page) || page < 1) {
        return 1
    }

    return Math.min(page, 4)
}

async function loadNextPage() {
    if (
        loading.value ||
        loadingMore.value ||
        !hasMore.value
    ) {
        return
    }

    const previousPage = currentPage.value

    await breedsStore.loadMore()

    if (currentPage.value > previousPage) {
        await router.replace({
        query: {
            ...route.query,
            page: String(currentPage.value),
        },
        })
    }
}

let observer: IntersectionObserver | undefined

onMounted(async () => {

    const targetPage = getTargetPage(route.query.page)

    while (
        currentPage.value < targetPage &&
        hasMore.value
    ) {
    const previousPage = currentPage.value

    await loadNextPage()

    if (currentPage.value === previousPage) {
        break
        }
    }

    observer = new IntersectionObserver(
        (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            void loadNextPage()
        }
        },
        {
        rootMargin: '300px',
        },
    )

    if (sentinel.value) {
        observer.observe(sentinel.value)
    }
})

onBeforeUnmount(() => {
    observer?.disconnect()

    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
})

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