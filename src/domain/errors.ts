export type ErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict";

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details: Record<string, string> = {},
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function badRequest(message: string): AppError {
  return new AppError("bad_request", message);
}

export function unauthorized(message = "Please sign in to continue."): AppError {
  return new AppError("unauthorized", message);
}

export function forbidden(message = "You are not allowed to do that."): AppError {
  return new AppError("forbidden", message);
}

export function notFound(kind: string, id: string): AppError {
  return new AppError("not_found", `${kind} '${id}' was not found.`, {
    kind,
    id,
  });
}

export function conflict(message: string): AppError {
  return new AppError("conflict", message);
}
