<template>
  <main class="mx-auto max-w-3xl p-6">
    <UButton
      to="/"
      variant="ghost"
      color="neutral"
      icon="i-lucide-arrow-left"
      class="mb-6"
    >
      Volver al directorio
    </UButton>

    <div
      v-if="pending"
      role="status"
      aria-live="polite"
    >
      Cargando información de la raza...
    </div>

    <div v-else-if="error" role="alert">
      No se pudo cargar la información.
      Intenta nuevamente.
    </div>

    <div v-else-if="!breed" role="status">
      No encontramos esa raza.
    </div>

    <article v-else class="space-y-6">
      <header>
        <p class="text-sm text-gray-500">
          Michiario
        </p>

        <h1 class="text-3xl font-bold">
          {{ breed.breed }}
        </h1>
      </header>

      <dl class="divide-y rounded-lg border">
        <div
          v-for="field in [
            { label: 'Breed', value: breed.breed },
            { label: 'Country', value: breed.country },
            { label: 'Origin', value: breed.origin },
            { label: 'Coat', value: breed.coat },
            { label: 'Pattern', value: breed.pattern },
          ]"
          :key="field.label"
          class="grid grid-cols-1 gap-1 p-4 sm:grid-cols-3"
        >
          <dt class="font-semibold">
            {{ field.label }}
          </dt>

          <dd class="sm:col-span-2">
            {{ field.value || 'No disponible' }}
          </dd>
        </div>
      </dl>

      <section
        class="rounded-lg border p-6"
        aria-labelledby="random-fact-title"
      >
        <div class="mb-4">
          <p class="text-sm text-gray-500">
            Random fact
          </p>

          <h2
            id="random-fact-title"
            class="text-xl font-semibold"
          >
            ¿Sabías que...?
          </h2>
        </div>

        <div
          v-if="factLoading"
          role="status"
          aria-live="polite"
        >
          Cargando dato...
        </div>

        <div
          v-else-if="factError"
          role="alert"
        >
          <p class="mb-3">
            No pudimos cargar el dato aleatorio.
          </p>
        </div>

        <p v-else-if="fact">
          {{ fact.fact }}
        </p>

        <UButton
            type="button"
            color="neutral"
            variant="outline"
            @click="loadRandomFact"
            class="mt-6"
          >
            Otro fact
          </UButton>

      </section>

    </article>
  </main>
</template>

<script setup lang="ts">
import type { Fact } from '~/types/catfact'
import { getBreedByName, getRandomFact } from '~/services/catfact'

const route = useRoute()

const breedName = computed(() => {
  const param = route.params.breed
  return Array.isArray(param) ? param[0] : param
})

const {
  data: breed,
  pending,
  error,
} = await useAsyncData(
  () => `breed-${breedName.value}`,
  () => getBreedByName(breedName.value)
)

const fact = ref<Fact | null>(null)
const factLoading = ref(false)
const factError = ref<unknown>(null)

async function loadRandomFact() {
  factLoading.value = true
  factError.value = null

  try {
    fact.value = await getRandomFact()
  } catch (error) {
    factError.value = error
  } finally {
    factLoading.value = false
  }
}

onMounted(() => {
  void loadRandomFact()
})

useSeoMeta({
  title: () => breed.value
    ? `${breed.value.breed} | Michiario`
    : 'Detalle de raza | Michiario',
  description: () => breed.value
    ? `Información sobre la raza ${breed.value.breed}, originaria de ${breed.value.origin}.`
    : 'Consulta los detalles de una raza de gato.',
})
</script>