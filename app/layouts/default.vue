<template>
    <div class="min-h-screen bg-background text-foreground">
        <header class="border-b">
        <div
            class="mx-auto flex max-w-5xl items-center justify-between p-4"
        >
            <NuxtLink
            to="/"
            class="text-xl font-bold"
            >
            Michiario
            </NuxtLink>

            <UButton
            type="button"
            :icon="
                colorMode.preference === 'dark'
                ? 'i-lucide-sun'
                : 'i-lucide-moon'
            "
            variant="ghost"
            :aria-label="
                colorMode.preference === 'dark'
                ? 'Cambiar a modo claro'
                : 'Cambiar a modo oscuro'
            "
            @click="toggleColorMode"
            />
        </div>
        </header>

        <main>
        <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
    colorMode.preference =
        colorMode.preference === 'dark'
        ? 'light'
        : 'dark'
}
</script>