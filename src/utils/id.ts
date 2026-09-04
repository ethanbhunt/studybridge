import { randomUUID } from "node:crypto";

export interface IdSource {
  next(prefix: "request" | "note" | "event"): string;
}

export class RandomIdSource implements IdSource {
  next(prefix: "request" | "note" | "event"): string {
    return `${prefix}_${randomUUID()}`;
  }
}

export class SequenceIdSource implements IdSource {
  private value = 0;

  constructor(private readonly label = "test") {}

  next(prefix: "request" | "note" | "event"): string {
    this.value += 1;
    return `${prefix}_${this.label}_${this.value}`;
  }
}
