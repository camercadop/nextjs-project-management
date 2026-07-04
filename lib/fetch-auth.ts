/**
 * Authenticated fetch wrapper that automatically refreshes the access token on 401.
 *
 * @param input - The resource URL or Request object to fetch.
 * @param init - Optional fetch configuration (method, headers, body, etc.).
 *
 * @returns The original response if successful, or the retried response after token refresh.
 */
export async function fetchAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const res = await fetch(input, init)
    if (res.status !== 401) return res

    const refresh = await fetch('/api/auth/refresh-token', { method: 'POST' })
    if (!refresh.ok) return res

    return fetch(input, init)
}
