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
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create note");
  }

  return data;
};

export const updateNote = async (session: string, noteId: number, note: Note) => {
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

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to update note");
  }

  return data;
};
