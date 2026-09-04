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

export async function listDemoAccounts(): Promise<AccountSummary[]> {
  const response = await requestJson<{ accounts: AccountSummary[] }>(
    "/api/demo/accounts",
  );
  return response.accounts;
}

export async function listRequests(
  viewerId: string,
  filters: RequestFilters,
): Promise<RequestSummary[]> {
  const search = new URLSearchParams({ viewerId });
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
  viewerId: string,
  requestId: string,
): Promise<{ request: RequestDetail; canWriteNotes: boolean }> {
  const search = new URLSearchParams({ viewerId });
  return requestJson(
    `/api/requests/${encodeURIComponent(requestId)}?${search}`,
  );
}

export async function claimRequest(
  actorId: string,
  requestId: string,
): Promise<void> {
  await post(`/api/requests/${encodeURIComponent(requestId)}/claim`, {
    actorId,
  });
}

export async function resolveRequest(
  actorId: string,
  requestId: string,
): Promise<void> {
  await post(`/api/requests/${encodeURIComponent(requestId)}/resolve`, {
    actorId,
  });
}

export async function addNote(input: {
  actorId: string;
  requestId: string;
  body: string;
  visibility: NoteVisibility;
}): Promise<void> {
  await post(`/api/requests/${encodeURIComponent(input.requestId)}/notes`, {
    actorId: input.actorId,
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
