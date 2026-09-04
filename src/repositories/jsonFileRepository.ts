import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { DatabaseState } from "../domain/types.js";
import { InMemoryRepository } from "./inMemoryRepository.js";

export class JsonFileRepository extends InMemoryRepository {
  private pendingWrite: Promise<void> = Promise.resolve();

  private constructor(
    initialState: DatabaseState,
    private readonly filename: string,
  ) {
    super(initialState);
  }

  static async open(
    filename: string,
    seedFilename: string,
  ): Promise<JsonFileRepository> {
    let state: DatabaseState;

    try {
      state = await readState(filename);
    } catch (error) {
      if (!isMissingFile(error)) {
        throw error;
      }
      state = await readState(seedFilename);
      await persist(filename, state);
    }

    return new JsonFileRepository(state, filename);
  }

  protected override async afterMutation(): Promise<void> {
    const nextState = this.snapshot();
    this.pendingWrite = this.pendingWrite.then(() =>
      persist(this.filename, nextState),
    );
    await this.pendingWrite;
  }
}

async function readState(filename: string): Promise<DatabaseState> {
  const source = await readFile(filename, "utf8");
  return JSON.parse(source) as DatabaseState;
}

async function persist(filename: string, state: DatabaseState): Promise<void> {
  await mkdir(dirname(filename), { recursive: true });
  const temporary = `${filename}.next`;
  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(temporary, filename);
}

function isMissingFile(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
