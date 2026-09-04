import type { IncomingMessage, ServerResponse } from "node:http";

const COOKIE_NAME = "studybridge_session";
const MAX_AGE_SECONDS = 8 * 60 * 60;

export function readSessionToken(request: IncomingMessage): string | undefined {
  const header = request.headers.cookie;
  if (header === undefined) {
    return undefined;
  }

  for (const item of header.split(";")) {
    const [name, ...parts] = item.trim().split("=");
    if (name === COOKIE_NAME) {
      const value = parts.join("=");
      return value.length === 0 ? undefined : decodeURIComponent(value);
    }
  }
  return undefined;
}

export function setSessionCookie(
  response: ServerResponse,
  token: string,
): void {
  response.setHeader(
    "set-cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`,
  );
}

export function clearSessionCookie(response: ServerResponse): void {
  response.setHeader(
    "set-cookie",
    `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );
}
