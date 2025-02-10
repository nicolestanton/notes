import { Note } from "@/types";

export const getUsers = async () => {
  const response = await fetch("https://challenge.surfe.com/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

export const getNotes = async (session: string) => {
  const response = await fetch(`https://challenge.surfe.com/${session}/notes`);
  if (!response.ok) throw new Error("Failed to fetch notes");
  return response.json();
};

export const createNote = async (session: string, note: Note) => {
  const response = await fetch(`https://challenge.surfe.com/${session}/notes`, {
    method: "POST",
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error("Failed to create note");
  return response.json();
};

export const updateNote = async (session: string, noteId: number, note: { body: string }) => {
  const response = await fetch(`https://challenge.surfe.com/${session}/notes/${noteId}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: noteId,
      body: note.body
    }),
  });
  if (!response.ok) throw new Error("Failed to update note");
  return response.json();
};
