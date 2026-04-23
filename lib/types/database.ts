export type WorkType = "website" | "social_media" | "branding" | "other";

export type UsersProfile = {
  id: string;
  admin_name: string;
  created_at: string;
};

export type ClientRow = {
  id: string;
  client_name: string;
  email: string;
  contact_number: string;
  country: string;
  work_type: WorkType;
  admin_name: string | null;
  created_at: string;
};

export type CashflowRow = {
  id: string;
  date: string;
  income: number;
  expense: number;
  details: string | null;
  client_id: string | null;
  work_type: WorkType;
  created_at: string;
};

export type CashflowWithClient = CashflowRow & {
  clients: Pick<ClientRow, "id" | "client_name" | "email"> | null;
};
