import type {
  Account,
  AuditEvent,
  HelpRequest,
  RequestNote,
} from "../domain/types.js";

export interface StudyBridgeRepository {
  listAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  saveAccount(account: Account): Promise<void>;

  listRequests(): Promise<HelpRequest[]>;
  getRequest(id: string): Promise<HelpRequest | undefined>;
  saveRequest(request: HelpRequest): Promise<void>;

  listNotesForRequest(requestId: string): Promise<RequestNote[]>;
  appendNote(note: RequestNote): Promise<void>;

  listAuditEvents(): Promise<AuditEvent[]>;
  appendAuditEvent(event: AuditEvent): Promise<void>;
}
