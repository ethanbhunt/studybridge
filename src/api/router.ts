import type { IncomingMessage, ServerResponse } from "node:http";
import { AppError } from "../domain/errors.js";
import {
  noteVisibilities,
  requestStatuses,
  type NoteVisibility,
  type RequestFilters,
  type RequestStatus,
} from "../domain/types.js";
import type { Application } from "../application.js";
import { readJson, requireString, sendError, sendJson } from "./http.js";

export type ApplicationProvider = () => Promise<Application>;

export function createApiHandler(getApplication: ApplicationProvider) {
  return async function handleApi(
    request: IncomingMessage,
    response: ServerResponse,
  ): Promise<void> {
    try {
      const url = new URL(request.url ?? "/", "http://studybridge.local");
      const method = request.method ?? "GET";

      if (method === "GET" && url.pathname === "/api/health") {
        sendJson(response, 200, { status: "ok" });
        return;
      }

      const application = await getApplication();

      if (method === "GET" && url.pathname === "/api/demo/accounts") {
        sendJson(response, 200, {
          accounts: await application.queries.listDemoAccounts(),
        });
        return;
      }

      if (method === "GET" && url.pathname === "/api/requests") {
        const viewerId = requiredQuery(url, "viewerId");
        const filters = parseFilters(url);
        sendJson(response, 200, {
          requests: await application.queries.listRequests(viewerId, filters),
        });
        return;
      }

      const detailMatch = url.pathname.match(/^\/api\/requests\/([^/]+)$/);
      if (method === "GET" && detailMatch?.[1] !== undefined) {
        const viewerId = requiredQuery(url, "viewerId");
        const requestId = decodeURIComponent(detailMatch[1]);
        sendJson(response, 200, {
          request: await application.queries.getRequest(viewerId, requestId),
          canWriteNotes: await application.queries.canViewerWriteNotes(viewerId),
        });
        return;
      }

      const actionMatch = url.pathname.match(
        /^\/api\/requests\/([^/]+)\/(claim|resolve)$/,
      );
      if (method === "POST" && actionMatch?.[1] !== undefined) {
        const requestId = decodeURIComponent(actionMatch[1]);
        const body = await readJson(request);
        const actorId = requireString(body.actorId, "actorId");
        const updated = actionMatch[2] === "claim"
          ? await application.requests.claimRequest(actorId, requestId)
          : await application.requests.resolveRequest(actorId, requestId);
        sendJson(response, 200, { request: updated });
        return;
      }

      const noteMatch = url.pathname.match(/^\/api\/requests\/([^/]+)\/notes$/);
      if (method === "POST" && noteMatch?.[1] !== undefined) {
        const body = await readJson(request);
        const visibility = requireString(body.visibility, "visibility");
        if (!noteVisibilities.includes(visibility as NoteVisibility)) {
          throw new AppError(
            "bad_request",
            "'visibility' must be 'public' or 'staff'.",
          );
        }
        const note = await application.requests.addNote({
          actorId: requireString(body.actorId, "actorId"),
          requestId: decodeURIComponent(noteMatch[1]),
          body: requireString(body.body, "body"),
          visibility: visibility as NoteVisibility,
        });
        sendJson(response, 201, { note });
        return;
      }

      const anonymizeMatch = url.pathname.match(
        /^\/api\/accounts\/([^/]+)\/anonymize$/,
      );
      if (method === "POST" && anonymizeMatch?.[1] !== undefined) {
        const body = await readJson(request);
        const account = await application.accounts.anonymizeAccount(
          requireString(body.actorId, "actorId"),
          decodeURIComponent(anonymizeMatch[1]),
        );
        sendJson(response, 200, { account });
        return;
      }

      sendJson(response, 404, {
        error: "not_found",
        message: "No API route matches this request.",
      });
    } catch (error) {
      sendError(response, error);
    }
  };
}

function requiredQuery(url: URL, name: string): string {
  const value = url.searchParams.get(name);
  if (value === null || value.length === 0) {
    throw new AppError("bad_request", `Query parameter '${name}' is required.`);
  }
  return value;
}

function parseFilters(url: URL): RequestFilters {
  const status = url.searchParams.get("status");
  const tag = url.searchParams.get("tag");
  if (status !== null && !requestStatuses.includes(status as RequestStatus)) {
    throw new AppError("bad_request", "Unknown request status filter.");
  }

  return {
    ...(status === null ? {} : { status: status as RequestStatus }),
    ...(tag === null || tag.length === 0 ? {} : { tag }),
  };
}
