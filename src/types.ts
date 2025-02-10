export type User = {
  id: number;
  first_name: string;
  last_name: string;
};


export type Note = {
  id: number;
  body: string;
  lastUpdated?: string;
  onUpdate?: (id: number, body: string) => Promise<void>;
  disabled?: boolean;
};

export type Error = {
  message: string;
};
