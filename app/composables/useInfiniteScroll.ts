interface InfiniteScrollOptions {
    threshold?: number
    disabled?: () => boolean
}

export function useInfiniteScroll(
    element: Ref<HTMLElement | null>,
    onLoadMore: () => void | Promise<void>,
    options: InfiniteScrollOptions = {},
    ) {
    const {
        threshold = 300,
        disabled = () => false,
    } = options

    let observer: IntersectionObserver | null = null

    function start() {
        if (!import.meta.client || !element.value) {
        return
        }

        observer?.disconnect()

        observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0]

            if (!entry?.isIntersecting || disabled()) {
            return
            }

            void onLoadMore()
        },
        {
            rootMargin: `0px 0px ${threshold}px 0px`,
        },
        )

        observer.observe(element.value)
    }

    function stop() {
        observer?.disconnect()
        observer = null
    }

    onMounted(start)

    watch(element, () => {
        start()
    })

    onBeforeUnmount(stop)

    return {
        start,
        stop,
    }
}