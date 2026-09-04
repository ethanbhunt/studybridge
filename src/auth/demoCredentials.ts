export interface DemoCredential {
  username: string;
  password: string;
  accountId: string;
}

// These intentionally simple credentials belong only to the fictional teaching
// app. They must never be reused as a production authentication design.
export const demoCredentials: DemoCredential[] = [
  { username: "student", password: "student", accountId: "acct_steve" },
  { username: "mentor", password: "mentor", accountId: "acct_morgan" },
  {
    username: "coordinator",
    password: "coordinator",
    accountId: "acct_priya",
  },
];
