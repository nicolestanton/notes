"use client";
import React from "react";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import { Note } from "@/Components/Note/Note";
import { createNote, getNotes, updateNote } from "@/endpoints";
import { Note as NoteType } from "@/types";
import { Loading } from "@/Components/Loading/Loading";
import { Error } from "@/Components/Error/Error";

export default function Home() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const SESSION = "finalSolution12";

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await getNotes(SESSION);

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
        setErrorMessage("Failed to fetch notes");
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const updateNoteContent = async (noteId: number, content: string) => {
    try {
      const existingNote = notes.find((note) => note.id === noteId);
      const timestamp = new Date().toISOString();

      if (existingNote) {
        await updateNote(SESSION, noteId, { id: noteId, body: content });
      } else {
        await createNote(SESSION, { id: noteId, body: content });
      }

      // Update timestamps in localStorage
      const storedTimestamps = JSON.parse(
        localStorage.getItem("noteTimestamps") || "{}"
      );
      storedTimestamps[noteId] = timestamp;
      localStorage.setItem("noteTimestamps", JSON.stringify(storedTimestamps));

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
      setErrorMessage("Failed to save note");
      throw error;
    }
  };

  if (errorMessage) {
    return <Error message={errorMessage} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Note
          disabled={isLoading}
          id={0}
          body={notes.find((n) => n.id === 0)?.body || ""}
          lastUpdated={notes.find((n) => n.id === 0)?.lastUpdated}
          onUpdate={updateNoteContent}
        />
      </main>
    </div>
  );
}
