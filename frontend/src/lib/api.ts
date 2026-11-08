const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      }
    } catch {
      //Keep the default error message if the response isn't valid JSON.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export default API_BASE_URL;
