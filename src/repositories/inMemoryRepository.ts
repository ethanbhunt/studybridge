import type {
  Account,
  AuditEvent,
  DatabaseState,
  HelpRequest,
  RequestNote,
} from "../domain/types.js";
import type { StudyBridgeRepository } from "./interfaces.js";

function copy<T>(value: T): T {
  return structuredClone(value);
}

export class InMemoryRepository implements StudyBridgeRepository {
  protected state: DatabaseState;

  constructor(initialState: DatabaseState) {
    this.state = copy(initialState);
  }

  async listAccounts(): Promise<Account[]> {
    return copy(this.state.accounts);
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const account = this.state.accounts.find((candidate) => candidate.id === id);
    return account === undefined ? undefined : copy(account);
  }

  async saveAccount(account: Account): Promise<void> {
    const index = this.state.accounts.findIndex(
      (candidate) => candidate.id === account.id,
    );
    if (index === -1) {
      this.state.accounts.push(copy(account));
    } else {
      this.state.accounts[index] = copy(account);
    }
    await this.afterMutation();
  }

  async listRequests(): Promise<HelpRequest[]> {
    return copy(this.state.requests);
  }

  async getRequest(id: string): Promise<HelpRequest | undefined> {
    const request = this.state.requests.find((candidate) => candidate.id === id);
    return request === undefined ? undefined : copy(request);
  }

  async saveRequest(request: HelpRequest): Promise<void> {
    const index = this.state.requests.findIndex(
      (candidate) => candidate.id === request.id,
    );
    if (index === -1) {
      this.state.requests.push(copy(request));
    } else {
      this.state.requests[index] = copy(request);
    }
    await this.afterMutation();
  }

  async listNotesForRequest(requestId: string): Promise<RequestNote[]> {
    return copy(
      this.state.notes.filter((note) => note.requestId === requestId),
    );
  }

  async appendNote(note: RequestNote): Promise<void> {
    this.state.notes.push(copy(note));
    await this.afterMutation();
  }

  async listAuditEvents(): Promise<AuditEvent[]> {
    return copy(this.state.auditEvents);
  }

  async appendAuditEvent(event: AuditEvent): Promise<void> {
    this.state.auditEvents.push(copy(event));
    await this.afterMutation();
  }

  snapshot(): DatabaseState {
    return copy(this.state);
  }

  protected async afterMutation(): Promise<void> {
    // The file-backed repository overrides this hook.
  }
}
