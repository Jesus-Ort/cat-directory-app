<template>
    <main class="mx-auto max-w-5xl p-6">
        <h1 class="mb-6 text-3xl font-bold">
        Michiario - Diccionario de Razas de michis 🐱
        </h1>

        <div v-if="loading" role="status" aria-live="polite">
        Cargando razas...
        </div>

        <div v-else-if="error" role="alert">
        No se pudieron cargar las razas.
        Intenta recargar la página.
        </div>

        <div v-else>
        <p class="mb-4 text-sm text-gray-500">
            Razas cargadas: {{ breeds.length }}
        </p>

        <ul class="space-y-3">
            <li
            v-for="breed in breeds"
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
        </div>
    </main>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBreedsStore } from '~/stores/breeds'

const breedsStore = useBreedsStore()

await callOnce('breeds-initial', () => {
    return breedsStore.loadInitial()
})

const {
    breeds,
    loading,
    error,
} = storeToRefs(breedsStore)
</script>