"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Note } from "@/Components/Note/Note";
import { createNote, getNotes, updateNote } from "@/endpoints";
import { Note as NoteType } from "@/types";

export default function Home() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const SESSION_NAME = "session12";

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes(SESSION_NAME);

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

  const updateNoteContent = async (noteId: number, content: string) => {
    try {
      const existingNote = notes.find((note) => note.id === noteId);

      const response = existingNote
        ? await updateNote(SESSION_NAME, Number(noteId), {
            body: content,
          })
        : await createNote(SESSION_NAME, {
            id: Number(noteId),
            body: content,
          });

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

      if (response.status !== 200) {
        throw new Error(
          `Failed to ${existingNote ? "update" : "create"} note ${noteId}`
        );
      }

      // Update local state
      const updatedNotes = existingNote
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
          id={0}
          body={notes.find((n) => n.id === 0)?.body || ""}
          lastUpdated={notes.find((n) => n.id === 0)?.lastUpdated}
          onUpdate={updateNoteContent}
        />
        <Note
          id={1}
          body={notes.find((n) => n.id === 1)?.body || ""}
          lastUpdated={notes.find((n) => n.id === 1)?.lastUpdated}
          onUpdate={updateNoteContent}
        />
      </main>
    </div>
  );
}
