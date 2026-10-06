interface RetryOptions {
    retries?: number
    baseDelay?: number
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    ): Promise<T> {
    const {
        retries = 3,
        baseDelay = 500,
    } = options

    let lastError: unknown

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
        return await operation()
        } catch (error) {
        lastError = error

        if (attempt === retries) {
            break
        }

        const delay = baseDelay * 2 ** attempt

        await sleep(delay)
        }
    }

    throw lastError
}