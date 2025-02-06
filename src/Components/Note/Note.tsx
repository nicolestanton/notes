"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./Note.module.scss";

type Note = {
  id: number | null;
  value: string;
};

type NoteResponse = {
  id: number | null;
  body: string;
};

export const Note = () => {
  const [noteData, setNoteData] = useState<Note>({ id: null, value: "" });
  const [latestNote, setLatestNote] = useState<NoteResponse | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SESSION_NAME = "session3";

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await fetch(
        `https://challenge.surfe.com/${SESSION_NAME}/notes`
      );
      const data = await response.json();
      setLatestNote(data[0]);
    };
    fetchNotes();
  }, []);

  const saveNote = async (content: string) => {
    try {
      let url = `https://challenge.surfe.com/${SESSION_NAME}/notes`;
      const method = latestNote ? "PUT" : "POST";

      if (latestNote) {
        url = `${url}/${latestNote.id}`;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: latestNote?.id, body: content }),
      });

      if (!response.ok)
        throw new Error(`Failed to ${noteData.id ? "update" : "save"} note`);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const saveContentAfterDelay = (content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(content);
    }, 1000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    setNoteData({ id: noteData.id, value: e.target.value });
    saveContentAfterDelay(e.target.value);
  };

  return (
    <div className={styles.note}>
      <span>Note</span>
      <textarea
        defaultValue={latestNote?.body}
        placeholder="add a note"
        onChange={handleChange}
      />
    </div>
  );
};

export default Note;
