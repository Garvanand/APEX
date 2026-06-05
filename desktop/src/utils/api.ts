export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  backoffMs: number = 1000
): Promise<Response> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res;
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        throw err;
      }
      console.warn(`[API] Fetch failed for ${url}. Retrying in ${backoffMs * attempt}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
    }
  }
  throw new Error("Unreachable");
}
