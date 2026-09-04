import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AuthService } from "../src/auth/authService.js";
import type { DemoCredential } from "../src/auth/demoCredentials.js";
import { AppError } from "../src/domain/errors.js";
import type { Clock } from "../src/utils/clock.js";
import { FixedClock } from "../src/utils/clock.js";
import { baseState } from "./fixtures.js";
import { InMemoryRepository } from "../src/repositories/inMemoryRepository.js";

const credentials: DemoCredential[] = [
  {
    username: "student",
    password: "student",
    accountId: "student_steve",
  },
  {
    username: "mentor",
    password: "mentor",
    accountId: "mentor_morgan",
  },
  {
    username: "coordinator",
    password: "coordinator",
    accountId: "coordinator_priya",
  },
];

describe("AuthService", () => {
  it("creates a session for valid generic credentials", async () => {
    const auth = createAuth();

    const result = await auth.login("student", "student");

    assert.equal(result.token, "test-token");
    assert.equal(result.account.id, "student_steve");
    assert.equal(result.account.role, "student");
    assert.deepEqual(await auth.accountForToken(result.token), result.account);
  });

  it("rejects a wrong password without revealing which field failed", async () => {
    const auth = createAuth();
    await assertLoginFailure(() => auth.login("student", "wrong"));
    await assertLoginFailure(() => auth.login("unknown", "unknown"));
  });

  it("rejects requests without a session", async () => {
    const auth = createAuth();
    await assert.rejects(
      () => auth.accountForToken(undefined),
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.code, "unauthorized");
        return true;
      },
    );
  });

  it("invalidates the session on logout", async () => {
    const auth = createAuth();
    const { token } = await auth.login("mentor", "mentor");
    auth.logout(token);

    await assert.rejects(() => auth.accountForToken(token));
  });

  it("expires a session after eight hours", async () => {
    let now = new Date("2026-02-14T10:00:00.000Z");
    const clock: Clock = { now: () => new Date(now) };
    const auth = createAuth(clock);
    const { token } = await auth.login("coordinator", "coordinator");

    now = new Date("2026-02-14T18:00:00.001Z");
    await assert.rejects(() => auth.accountForToken(token));
  });

  it("does not create a session for an inactive account", async () => {
    const repository = new InMemoryRepository(baseState());
    const auth = new AuthService(
      repository,
      new FixedClock(new Date("2026-02-14T10:00:00.000Z")),
      [
        {
          username: "inactive",
          password: "inactive",
          accountId: "mentor_inactive",
        },
      ],
      () => "test-token",
    );
    await assertLoginFailure(() => auth.login("inactive", "inactive"));
  });
});

function createAuth(clock: Clock = new FixedClock(new Date("2026-02-14T10:00:00.000Z"))): AuthService {
  return new AuthService(
    new InMemoryRepository(baseState()),
    clock,
    credentials,
    () => "test-token",
  );
}

async function assertLoginFailure(
  action: () => Promise<unknown>,
): Promise<void> {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, "unauthorized");
    assert.equal(error.message, "The username or password is incorrect.");
    return true;
  });
}
