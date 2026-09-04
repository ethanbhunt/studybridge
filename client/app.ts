import {
  addNote,
  claimRequest,
  getRequest,
  listDemoAccounts,
  listRequests,
  resolveRequest,
} from "./api.js";
import { button, byId, clear, formatDate, text } from "./dom.js";
import type {
  AccountSummary,
  NoteVisibility,
  RequestDetail,
  RequestFilters,
  RequestStatus,
  RequestSummary,
} from "./types.js";

interface State {
  accounts: AccountSummary[];
  viewerId: string;
  requests: RequestSummary[];
  selectedId?: string;
  filters: RequestFilters;
  loading: boolean;
}

const state: State = {
  accounts: [],
  viewerId: "",
  requests: [],
  filters: {},
  loading: true,
};

const viewerSelect = byId<HTMLSelectElement>("viewer");
const statusSelect = byId<HTMLSelectElement>("status-filter");
const tagInput = byId<HTMLInputElement>("tag-filter");
const requestList = byId<HTMLElement>("request-list");
const summary = byId<HTMLElement>("summary");
const errorBanner = byId<HTMLElement>("error-banner");
const detailDialog = byId<HTMLDialogElement>("request-dialog");
const detailContent = byId<HTMLElement>("dialog-content");

viewerSelect.addEventListener("change", () => {
  state.viewerId = viewerSelect.value;
  void refreshRequests();
});

statusSelect.addEventListener("change", () => {
  const status = statusSelect.value;
  const { status: _previousStatus, ...otherFilters } = state.filters;
  state.filters = status === ""
    ? otherFilters
    : { ...otherFilters, status: status as RequestStatus };
  void refreshRequests();
});

tagInput.addEventListener("change", () => {
  state.filters = { ...state.filters, tag: tagInput.value };
  void refreshRequests();
});

byId<HTMLButtonElement>("refresh").addEventListener("click", () => {
  void refreshRequests();
});

byId<HTMLButtonElement>("close-dialog").addEventListener("click", () => {
  detailDialog.close();
});

void initialize();

async function initialize(): Promise<void> {
  try {
    state.accounts = await listDemoAccounts();
    const student = state.accounts.find((account) => account.role === "student");
    state.viewerId = student?.id ?? state.accounts[0]?.id ?? "";
    renderViewerOptions();
    await refreshRequests();
  } catch (error) {
    showError(error);
  }
}

async function refreshRequests(): Promise<void> {
  if (state.viewerId.length === 0) {
    return;
  }
  state.loading = true;
  renderList();
  hideError();
  try {
    state.requests = await listRequests(state.viewerId, state.filters);
  } catch (error) {
    showError(error);
  } finally {
    state.loading = false;
    renderList();
  }
}

function renderViewerOptions(): void {
  clear(viewerSelect);
  for (const account of state.accounts) {
    const option = document.createElement("option");
    option.value = account.id;
    option.textContent = `${account.displayName} · ${roleLabel(account.role)}`;
    option.selected = account.id === state.viewerId;
    viewerSelect.append(option);
  }
}

function renderList(): void {
  clear(requestList);
  if (state.loading) {
    requestList.append(text("p", "Loading support requests…", "empty-state"));
    summary.textContent = "Loading";
    return;
  }

  summary.textContent = `${state.requests.length} ${
    state.requests.length === 1 ? "request" : "requests"
  }`;
  if (state.requests.length === 0) {
    const label = state.filters.status === undefined
      ? "No support requests match these filters."
      : `No ${state.filters.status} support requests match these filters.`;
    requestList.append(text("p", label, "empty-state"));
    return;
  }

  for (const request of state.requests) {
    requestList.append(renderCard(request));
  }
}

function renderCard(request: RequestSummary): HTMLElement {
  const card = document.createElement("article");
  card.className = `request-card priority-${request.priority}`;

  const headingRow = document.createElement("div");
  headingRow.className = "card-heading";
  const titleBox = document.createElement("div");
  titleBox.append(
    text("p", priorityLabel(request.priority), "priority-label"),
    text("h2", request.title),
  );
  headingRow.append(titleBox, text("span", request.status, `status status-${request.status}`));

  const description = text("p", request.description, "description");
  const metadata = text(
    "p",
    `Student: ${request.requester.displayName} · Mentor: ${
      request.assignee?.displayName ?? "Not assigned"
    } · ${request.visibleNoteCount} ${
      request.visibleNoteCount === 1 ? "note" : "notes"
    }`,
    "metadata",
  );

  const footer = document.createElement("div");
  footer.className = "card-footer";
  const tags = document.createElement("div");
  tags.className = "tags";
  for (const tag of request.tags) {
    tags.append(text("span", tag, "tag"));
  }
  footer.append(
    tags,
    button("View request", "button button-secondary", () => openDetail(request.id)),
  );

  card.append(headingRow, description, metadata, footer);
  return card;
}

async function openDetail(requestId: string): Promise<void> {
  state.selectedId = requestId;
  clear(detailContent);
  detailContent.append(text("p", "Loading request…", "empty-state"));
  if (!detailDialog.open) {
    detailDialog.showModal();
  }

  try {
    const result = await getRequest(state.viewerId, requestId);
    renderDetail(result.request, result.canWriteNotes);
  } catch (error) {
    detailDialog.close();
    showError(error);
  }
}

function renderDetail(request: RequestDetail, canWriteNotes: boolean): void {
  clear(detailContent);
  const heading = document.createElement("div");
  heading.className = "detail-heading";
  heading.append(
    text("p", priorityLabel(request.priority), "priority-label"),
    text("h2", request.title),
    text(
      "p",
      `${request.status} · opened ${formatDate(request.createdAt)} by ${request.requester.displayName}`,
      "metadata",
    ),
  );
  detailContent.append(heading, text("p", request.description, "detail-description"));

  const actions = renderActions(request);
  if (actions.childElementCount > 0) {
    detailContent.append(actions);
  }

  const notesSection = document.createElement("section");
  notesSection.className = "notes";
  notesSection.append(text("h3", `Notes (${request.notes.length})`));
  if (request.notes.length === 0) {
    notesSection.append(text("p", "No visible notes yet.", "empty-state compact"));
  } else {
    for (const note of request.notes) {
      const item = document.createElement("article");
      item.className = `note note-${note.visibility}`;
      item.append(
        text(
          "p",
          `${note.author.displayName} · ${formatDate(note.createdAt)} · ${
            note.visibility === "staff" ? "Staff note" : "Public note"
          }`,
          "note-heading",
        ),
        text("p", note.body),
      );
      notesSection.append(item);
    }
  }
  detailContent.append(notesSection);

  if (canWriteNotes) {
    detailContent.append(renderNoteForm(request.id));
  }
}

function renderActions(request: RequestDetail): HTMLElement {
  const actions = document.createElement("div");
  actions.className = "actions";
  const viewer = currentViewer();
  if (request.status === "open" && viewer.role !== "student") {
    actions.append(
      button("Claim request", "button button-primary", () =>
        runMutation(() => claimRequest(viewer.id, request.id))),
    );
  }
  const canAttemptResolve =
    request.status !== "resolved" && viewer.role !== "student";
  if (canAttemptResolve) {
    actions.append(
      button("Mark resolved", "button button-secondary", () =>
        runMutation(() => resolveRequest(viewer.id, request.id))),
    );
  }
  return actions;
}

function renderNoteForm(requestId: string): HTMLElement {
  const form = document.createElement("form");
  form.className = "note-form";
  const heading = text("h3", "Add a note");
  const label = text("label", "Note text", "field-label");
  const textarea = document.createElement("textarea");
  textarea.name = "body";
  textarea.rows = 4;
  textarea.maxLength = 700;
  textarea.required = true;
  label.append(textarea);

  const visibilityLabel = text("label", "Who can see it?", "field-label");
  const visibility = document.createElement("select");
  visibility.name = "visibility";
  visibility.append(new Option("Student and staff", "public"));
  visibility.append(new Option("Staff only", "staff"));
  visibilityLabel.append(visibility);

  const submit = text("button", "Add note", "button button-primary");
  submit.type = "submit";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = visibility.value as NoteVisibility;
    void runMutation(() =>
      addNote({
        actorId: state.viewerId,
        requestId,
        body: textarea.value,
        visibility: value,
      }),
    );
  });
  form.append(heading, label, visibilityLabel, submit);
  return form;
}

async function runMutation(action: () => Promise<void>): Promise<void> {
  hideError();
  try {
    await action();
    await refreshRequests();
    if (state.selectedId !== undefined) {
      await openDetail(state.selectedId);
    }
  } catch (error) {
    showError(error);
  }
}

function currentViewer(): AccountSummary {
  const viewer = state.accounts.find((account) => account.id === state.viewerId);
  if (viewer === undefined) {
    throw new Error("The selected demo account no longer exists.");
  }
  return viewer;
}

function priorityLabel(priority: RequestSummary["priority"]): string {
  return `${priority[0]?.toUpperCase() ?? ""}${priority.slice(1)} priority`;
}

function roleLabel(role: AccountSummary["role"]): string {
  return `${role[0]?.toUpperCase() ?? ""}${role.slice(1)}`;
}

function showError(error: unknown): void {
  errorBanner.textContent = error instanceof Error ? error.message : "Something went wrong.";
  errorBanner.hidden = false;
}

function hideError(): void {
  errorBanner.hidden = true;
  errorBanner.textContent = "";
}
