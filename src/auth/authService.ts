import { randomUUID, timingSafeEqual } from "node:crypto";
import { unauthorized } from "../domain/errors.js";
import type { AccountSummary } from "../domain/types.js";
import type { StudyBridgeRepository } from "../repositories/interfaces.js";
import type { Clock } from "../utils/clock.js";
import type { DemoCredential } from "./demoCredentials.js";

interface Session {
  accountId: string;
  expiresAt: number;
}

export interface LoginResult {
  token: string;
  account: AccountSummary;
}

const SESSION_DURATION_MS = 8 * 60 * 60 * 1_000;

export class AuthService {
  private readonly sessions = new Map<string, Session>();

  constructor(
    private readonly repository: StudyBridgeRepository,
    private readonly clock: Clock,
    private readonly credentials: DemoCredential[],
    private readonly createToken: () => string = randomUUID,
  ) {}

  async login(username: string, password: string): Promise<LoginResult> {
    const credential = this.credentials.find(
      (candidate) => safeEqual(candidate.username, username),
    );
    if (credential === undefined || !safeEqual(credential.password, password)) {
      throw unauthorized("The username or password is incorrect.");
    }

    const account = await this.repository.getAccount(credential.accountId);
    if (account === undefined || !account.active) {
      throw unauthorized("The username or password is incorrect.");
    }

    const token = this.createToken();
    this.sessions.set(token, {
      accountId: account.id,
      expiresAt: this.clock.now().getTime() + SESSION_DURATION_MS,
    });
    return { token, account: accountSummary(account) };
  }

  async accountForToken(token: string | undefined): Promise<AccountSummary> {
    if (token === undefined) {
      throw unauthorized();
    }
    const session = this.sessions.get(token);
    if (session === undefined || session.expiresAt <= this.clock.now().getTime()) {
      this.sessions.delete(token);
      throw unauthorized("Your session has expired. Please sign in again.");
    }

    const account = await this.repository.getAccount(session.accountId);
    if (account === undefined || !account.active) {
      this.sessions.delete(token);
      throw unauthorized("Your session has expired. Please sign in again.");
    }
    return accountSummary(account);
  }

  logout(token: string | undefined): void {
    if (token !== undefined) {
      this.sessions.delete(token);
    }
  }
}

function accountSummary(account: {
  id: string;
  displayName: string;
  role: AccountSummary["role"];
  active: boolean;
}): AccountSummary {
  return {
    id: account.id,
    displayName: account.displayName,
    role: account.role,
    active: account.active,
  };
}

function safeEqual(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected);
  const actualBytes = Buffer.from(actual);
  return expectedBytes.length === actualBytes.length &&
    timingSafeEqual(expectedBytes, actualBytes);
}
