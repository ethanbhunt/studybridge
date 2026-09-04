import type {
  AccountSummary,
  NoteVisibility,
  RequestDetail,
  RequestFilters,
  RequestSummary,
} from "./types.js";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function login(
  username: string,
  password: string,
): Promise<AccountSummary> {
  const response = await requestJson<{ account: AccountSummary }>(
    "/api/auth/login",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    },
  );
  return response.account;
}

export async function currentSession(): Promise<AccountSummary> {
  const response = await requestJson<{ account: AccountSummary }>(
    "/api/auth/session",
  );
  return response.account;
}

export async function logout(): Promise<void> {
  await requestJson("/api/auth/logout", { method: "POST" });
}

export async function listRequests(
  filters: RequestFilters,
): Promise<RequestSummary[]> {
  const search = new URLSearchParams();
  if (filters.status !== undefined) {
    search.set("status", filters.status);
  }
  if (filters.tag !== undefined && filters.tag.trim().length > 0) {
    search.set("tag", filters.tag.trim());
  }
  const response = await requestJson<{ requests: RequestSummary[] }>(
    `/api/requests?${search}`,
  );
  return response.requests;
}

export async function getRequest(
  requestId: string,
): Promise<{ request: RequestDetail; canWriteNotes: boolean }> {
  return requestJson(`/api/requests/${encodeURIComponent(requestId)}`);
}

export async function claimRequest(
  requestId: string,
): Promise<void> {
  await post(`/api/requests/${encodeURIComponent(requestId)}/claim`, {});
}

export async function resolveRequest(
  requestId: string,
): Promise<void> {
  await post(`/api/requests/${encodeURIComponent(requestId)}/resolve`, {});
}

export async function addNote(input: {
  requestId: string;
  body: string;
  visibility: NoteVisibility;
}): Promise<void> {
  await post(`/api/requests/${encodeURIComponent(input.requestId)}/notes`, {
    body: input.body,
    visibility: input.visibility,
  });
}

async function post(path: string, body: Record<string, string>): Promise<void> {
  await requestJson(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, init);
  const value = (await response.json()) as unknown;
  if (!response.ok) {
    const message = isErrorResponse(value)
      ? value.message
      : `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status);
  }
  return value as T;
}

function isErrorResponse(value: unknown): value is { message: string } {
  return (
    value !== null &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  );
}
