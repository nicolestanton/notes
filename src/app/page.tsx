"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Note } from "@/Components/Note/Note";

type NoteType = {
  id: number;
  body: string;
  lastUpdated: string;
  updated_at?: string;
};

export default function Home() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const SESSION_NAME = "session7";

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(
          `https://challenge.surfe.com/${SESSION_NAME}/notes`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        const data = await response.json();

        // Get stored timestamps from localStorage
        const storedTimestamps = JSON.parse(
          localStorage.getItem("noteTimestamps") || "{}"
        );

        // Combine server data with stored timestamps
        const notesWithTimestamps = data.map((note: NoteType) => ({
          ...note,
          lastUpdated: storedTimestamps[note.id] || new Date().toISOString(),
        }));

        setNotes(notesWithTimestamps);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    fetchNotes();
  }, []);

  const updateNote = async (noteId: number, content: string) => {
    try {
      let url = `https://challenge.surfe.com/${SESSION_NAME}/notes`;
      let method = "POST";

      const existingNote = notes.find((note) => note.id === noteId);
      if (existingNote) {
        url = `${url}/${noteId}`;
        method = "PUT";
      }

      // Only update timestamp if content changed or it's a new note
      const contentChanged = existingNote?.body !== content;
      let timestamp = existingNote?.lastUpdated || new Date().toISOString();

      if (contentChanged) {
        timestamp = new Date().toISOString();
        // Update timestamps in localStorage
        const storedTimestamps = JSON.parse(
          localStorage.getItem("noteTimestamps") || "{}"
        );
        storedTimestamps[noteId] = timestamp;
        localStorage.setItem(
          "noteTimestamps",
          JSON.stringify(storedTimestamps)
        );
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: noteId,
          body: content,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${method === "PUT" ? "update" : "create"} note ${noteId}`
        );
      }

      // Update local state
      const updatedNotes =
        method === "PUT"
          ? notes.map((note) =>
              note.id === noteId
                ? { ...note, body: content, lastUpdated: timestamp }
                : note
            )
          : [...notes, { id: noteId, body: content, lastUpdated: timestamp }];

      setNotes(updatedNotes);
    } catch (error) {
      console.error(`Error saving note ${noteId}:`, error);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Note
          noteId={0}
          initialContent={notes.find((n) => n.id === 0)?.body || ""}
          lastUpdated={notes.find((n) => n.id === 0)?.lastUpdated}
          onUpdate={updateNote}
        />
      </main>
    </div>
  );
}
