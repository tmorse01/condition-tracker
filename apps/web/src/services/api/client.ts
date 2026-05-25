const apiBase = "";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export const requestJson = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBase}${input}`, init);
  const json = (await response.json()) as { data?: T; error?: string };
  if (!response.ok) {
    throw new ApiError(json.error ?? "Request failed", response.status);
  }
  return json.data as T;
};

