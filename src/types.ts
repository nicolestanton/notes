export type User = {
  id: number;
  first_name: string;
};


export type Note = {
  id: number;
  body: string;
  lastUpdated?: string;
  onUpdate?: (id: number, body: string) => Promise<void>;
};
