"use client";
import { useRef, useState } from "react";
import styles from "./Note.module.scss";

type Note = {
  id: number | null;
  value: string;
};

export const Note = () => {
  const [noteData, setNoteData] = useState<Note>({ id: null, value: "" });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SESSION_NAME = "session1";

  const saveNote = async (content: string) => {
    try {
      let url = `https://challenge.surfe.com/${SESSION_NAME}/notes`;
      const method = noteData.id ? "PUT" : "POST";

      if (noteData.id) {
        url = `${url}/${noteData.id}`;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteData.id, body: content }),
      });

      if (!response.ok)
        throw new Error(`Failed to ${noteData.id ? "update" : "save"} note`);

      const data = await response.json();
      if (!noteData.id && data.id) {
        setNoteData({ id: data.id, value: content });
      }
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

  console.log("noteData", noteData);

  return (
    <div className={styles.note}>
      <span>Note</span>
      <textarea
        defaultValue={noteData.value}
        placeholder="add a note"
        onChange={handleChange}
      />
    </div>
  );
};

export default Note;
