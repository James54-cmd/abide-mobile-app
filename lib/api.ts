import { API_URL } from "@/constants/config";

export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<T> {
  if (!API_URL.trim()) {
    throw new Error(
      "API URL is not set. Add EXPO_PUBLIC_API_URL (or NEXT_PUBLIC_API_URL) to .env.local — see app.config.ts — then restart Expo."
    );
  }

  const url = `${API_URL}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {})
      }
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : "Unknown network error";
    throw new Error(`Network request failed: ${url} (${reason})`);
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}
