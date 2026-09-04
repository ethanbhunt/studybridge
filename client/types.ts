export type AccountRole = "student" | "mentor" | "coordinator";
export type RequestStatus = "open" | "claimed" | "resolved";
export type Priority = "low" | "normal" | "high";
export type NoteVisibility = "public" | "staff";

export interface AccountSummary {
  id: string;
  displayName: string;
  role: AccountRole;
  active: boolean;
}

export interface RequestSummary {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  requester: AccountSummary;
  assignee: AccountSummary | null;
  visibleNoteCount: number;
}

export interface NoteView {
  id: string;
  body: string;
  visibility: NoteVisibility;
  createdAt: string;
  author: AccountSummary;
}

export interface RequestDetail extends RequestSummary {
  notes: NoteView[];
}

export interface RequestFilters {
  status?: RequestStatus;
  tag?: string;
}
