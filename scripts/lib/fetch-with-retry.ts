export interface FetchWithRetryOptions {
  maxAttempts?: number;
  timeoutMs?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit & FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxAttempts = 3,
    timeoutMs = 30000,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = Math.min(initialDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
        const jitter = Math.random() * delay * 0.2;
        console.warn(
          `[fetchWithRetry] Attempt ${attempt}/${maxAttempts} failed: ${err.message}. Retrying in ${Math.round(delay + jitter)}ms...`
        );
        await new Promise((r) => setTimeout(r, delay + jitter));
      }
    }
  }

  throw lastError ?? new Error("fetchWithRetry: all attempts failed");
}
