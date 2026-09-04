import type { DatabaseState } from "../src/domain/types.js";
import { InMemoryRepository } from "../src/repositories/inMemoryRepository.js";
import { AccountService } from "../src/services/accountService.js";
import { QueryService } from "../src/services/queryService.js";
import { RequestService } from "../src/services/requestService.js";
import { FixedClock } from "../src/utils/clock.js";
import { SequenceIdSource } from "../src/utils/id.js";

export const NOW = "2026-02-14T18:30:00.000Z";

export function baseState(): DatabaseState {
  return {
    accounts: [
      {
        id: "student_steve",
        displayName: "Steve Student",
        email: "steve@example.test",
        role: "student",
        active: true,
        createdAt: "2025-09-01T16:00:00.000Z",
      },
      {
        id: "student_lee",
        displayName: "Lee Learner",
        email: "lee@example.test",
        role: "student",
        active: true,
        createdAt: "2025-09-02T16:00:00.000Z",
      },
      {
        id: "mentor_morgan",
        displayName: "Morgan Mentor",
        email: "morgan@example.test",
        role: "mentor",
        active: true,
        createdAt: "2025-08-20T16:00:00.000Z",
      },
      {
        id: "mentor_inactive",
        displayName: "Inactive Mentor",
        email: "inactive@example.test",
        role: "mentor",
        active: false,
        createdAt: "2025-08-20T16:00:00.000Z",
      },
      {
        id: "coordinator_priya",
        displayName: "Priya Coordinator",
        email: "priya@example.test",
        role: "coordinator",
        active: true,
        createdAt: "2025-08-01T16:00:00.000Z",
      },
    ],
    requests: [
      {
        id: "request_calculus",
        title: "Work through related rates",
        description: "I need help setting up the equations.",
        requesterId: "student_steve",
        status: "open",
        priority: "high",
        tags: ["Calculus", "Tutoring"],
        createdAt: "2026-02-10T17:00:00.000Z",
        updatedAt: "2026-02-10T17:00:00.000Z",
      },
      {
        id: "request_planning",
        title: "Plan a busy exam week",
        description: "Three exams are close together.",
        requesterId: "student_steve",
        assigneeId: "mentor_morgan",
        status: "claimed",
        priority: "normal",
        tags: ["Study Skills", "Planning"],
        createdAt: "2026-02-09T17:00:00.000Z",
        updatedAt: "2026-02-11T17:00:00.000Z",
      },
      {
        id: "request_writing",
        title: "Organize a lab report",
        description: "I need help outlining the discussion section.",
        requesterId: "student_lee",
        status: "open",
        priority: "normal",
        tags: ["Writing", "Chemistry"],
        createdAt: "2026-02-12T17:00:00.000Z",
        updatedAt: "2026-02-12T17:00:00.000Z",
      },
      {
        id: "request_resolved",
        title: "Review Python conditionals",
        description: "Resolved example.",
        requesterId: "student_lee",
        assigneeId: "mentor_morgan",
        status: "resolved",
        priority: "low",
        tags: ["Programming"],
        createdAt: "2026-01-20T17:00:00.000Z",
        updatedAt: "2026-01-22T17:00:00.000Z",
        resolvedAt: "2026-01-22T17:00:00.000Z",
      },
      {
        id: "request_inactive_claim",
        title: "Make a weekly checklist",
        description: "Assigned before the mentor account became inactive.",
        requesterId: "student_lee",
        assigneeId: "mentor_inactive",
        status: "claimed",
        priority: "low",
        tags: ["Planning"],
        createdAt: "2026-01-18T17:00:00.000Z",
        updatedAt: "2026-01-19T17:00:00.000Z"
      }
    ],
    notes: [
      {
        id: "note_public",
        requestId: "request_planning",
        authorId: "mentor_morgan",
        body: "Bring your exam calendar to our meeting.",
        visibility: "public",
        createdAt: "2026-02-11T17:00:00.000Z",
      },
      {
        id: "note_staff",
        requestId: "request_planning",
        authorId: "coordinator_priya",
        body: "A second mentor is available next week if needed.",
        visibility: "staff",
        createdAt: "2026-02-11T18:00:00.000Z",
      },
    ],
    auditEvents: [],
  };
}

export function createTestContext() {
  const repository = new InMemoryRepository(baseState());
  const clock = new FixedClock(new Date(NOW));
  const ids = new SequenceIdSource("suite");
  return {
    repository,
    accounts: new AccountService(repository, clock, ids),
    queries: new QueryService(repository),
    requests: new RequestService(repository, clock, ids),
  };
}
