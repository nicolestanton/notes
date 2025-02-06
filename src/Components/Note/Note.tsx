"use client";
import { useState } from "react";
import styles from "./Note.module.scss";

type Note = {
  id: number;
  value: string;
};

export const Note = () => {
  const [noteValue, setNoteValue] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    setNoteValue(e.target.value);
  };

  return (
    <div className={styles.note}>
      <span>Note</span>
      <textarea
        defaultValue={noteValue}
        placeholder="add a note"
        onChange={handleChange}
      />
    </div>
  );
};

export default Note;
