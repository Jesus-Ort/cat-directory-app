<template>
    <main class="mx-auto max-w-5xl p-6">
        <h1 class="mb-6 text-center text-3xl font-bold">
        Michiario - Diccionario de Razas de michis 🐱
        </h1>

        <div class="mb-6">
        <label
            for="breed-search"
            class="mb-2 block font-medium"
        >
            Buscar raza o país
        </label>

        <div class="flex gap-4">
            <UInput
            id="breed-search"
            v-model="searchInput"
            placeholder="Ej. Siamese, Egypt..."
            class="w-full"
            />

            <UButton
            type="button"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            :disabled="loading || loadingMore"
            aria-label="Actualizar lista de razas"
            @click="handleRefresh"
            />
        </div>
        </div>

        <!-- Carga inicial -->
        <div
        v-if="loading"
        role="status"
        aria-live="polite"
        aria-label="Cargando razas"
        class="space-y-3"
        >
        <USkeleton
            v-for="index in 8"
            :key="index"
            class="h-20 w-full"
        />
        </div>

        <!-- Error inicial -->
        <div
        v-else-if="error"
        role="alert"
        class="py-8 text-center"
        >
        <p class="mb-4">
            No se pudieron cargar las razas.
        </p>

        <UButton
            type="button"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            :disabled="loading"
            @click="handleRefresh"
        >
            Intentar nuevamente
        </UButton>
        </div>

        <!-- Contenido -->
        <div v-else>
        <p
            class="mb-4 text-sm text-gray-500"
            aria-live="polite"
        >
            {{ filteredBreeds.length }} resultados
        </p>

        <UScrollArea
            :items="filteredBreeds"
            :virtualize="{
            estimateSize: 100,
            overscan: 5,
            }"
            :aria-busy="loadingMore"
            class="h-[600px] w-full"
            aria-label="Directorio de razas de gatos"
            @scroll="handleScroll"
        >
            <template #default="{ item: breed, index }">
            <article
                class="border-b p-4"
                :aria-posinset="index + 1"
                :aria-setsize="filteredBreeds.length"
            >
                <NuxtLink
                :to="`/breeds/${encodeURIComponent(breed.breed)}`"
                class="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                <h2 class="font-semibold">
                    {{ breed.breed }}
                </h2>

                <p class="text-sm text-gray-500">
                    País: {{ breed.country }}
                </p>
                </NuxtLink>
            </article>
            </template>
        </UScrollArea>

        <!-- Cargando siguiente página -->
        <div
            v-if="loadingMore"
            role="status"
            aria-live="polite"
            aria-label="Cargando más razas"
            class="space-y-3 py-4"
        >
            <USkeleton
            v-for="index in 2"
            :key="index"
            class="h-20 w-full"
            />
        </div>

        <!-- Fin de resultados -->
        <p
            v-if="!hasMore && breeds.length > 0"
            class="py-4 text-center text-sm text-gray-500"
        >
            Has llegado al final de la lista.
        </p>

        <!-- Sin resultados -->
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

function getSearchQuery(value: unknown): string {
    return typeof value === 'string' ? value : ''
}

const searchInput = ref(
    getSearchQuery(route.query.search),
)

const filteredBreeds = computed(() => {
    const query = searchInput.value
        .trim()
        .toLocaleLowerCase()

    if (!query) {
        return breeds.value
    }

    return breeds.value.filter((breed) => {
        return (
        breed.breed
            .toLocaleLowerCase()
            .includes(query) ||
        breed.country
            .toLocaleLowerCase()
            .includes(query)
        )
    })
})

let debounceTimer:
    | ReturnType<typeof setTimeout>
    | undefined

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

let isLoadingNextPage = false

async function loadNextPage() {
    if (
        isLoadingNextPage ||
        loading.value ||
        loadingMore.value ||
        !hasMore.value
    ) {
        return false
    }

    isLoadingNextPage = true

    try {
        const previousPage = currentPage.value

        await breedsStore.loadMore()

        return currentPage.value > previousPage
    } finally {
        isLoadingNextPage = false
    }
}

function updatePageQuery() {
    return router.replace({
        query: {
        ...route.query,
        page: String(currentPage.value),
        },
    })
}

function getTargetPage(value: unknown): number {
    const raw = Array.isArray(value)
        ? value[0]
        : value

    const page = Number(raw)

    if (!Number.isSafeInteger(page) || page < 1) {
        return 1
    }

    return Math.min(page, 100)
}

async function restorePageFromUrl() {
    const targetPage = getTargetPage(route.query.page)

    while (
        currentPage.value < targetPage &&
        hasMore.value
    ) {
        const loaded = await loadNextPage()

        if (!loaded) {
        break
        }
    }
}

let scrollFrame: number | undefined

function handleScroll() {
    
    if (scrollFrame !== undefined) {
        return
    }

    scrollFrame = requestAnimationFrame(() => {
        scrollFrame = undefined

        void checkScrollPosition()
    })
}

async function checkScrollPosition() {

    if (
        isLoadingNextPage ||
        loading.value ||
        loadingMore.value ||
        !hasMore.value
    ) {
        return
    }

    await nextTick()

    const scrollArea = document.querySelector(
        '[aria-label="Directorio de razas de gatos"]',
    )

    if (!scrollArea) {
        return
    }

    const viewport = scrollArea.querySelector(
        '[data-slot="viewport"]',
    ) as HTMLElement | null

    if (!viewport) {
        return
    }

    const distanceFromBottom =
        viewport.scrollHeight -
        viewport.scrollTop -
        viewport.clientHeight

    if (distanceFromBottom > 150) {
        return
    }

    const loaded = await loadNextPage()

    if (loaded) {
        await updatePageQuery()
    }
}

async function handleRefresh() {
    await breedsStore.refresh()

    await router.replace({
        query: {
        ...route.query,
        page: '1',
        },
    })
}

onMounted(() => {
    void restorePageFromUrl()
})

onBeforeUnmount(() => {
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    if (scrollFrame !== undefined) {
        cancelAnimationFrame(scrollFrame)
    }
})
</script>