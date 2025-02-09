"use client";
import { useRef, useState, useEffect } from "react";
import styles from "./Note.module.scss";

type User = {
  id: number;
  first_name: string;
};

type NoteProps = {
  noteId: number;
  initialContent: string;
  lastUpdated?: string;
  onUpdate: (noteId: number, content: string) => Promise<void>;
};

export const Note = ({
  noteId,
  initialContent,
  lastUpdated,
  onUpdate,
}: NoteProps) => {
  const [value, setValue] = useState(initialContent);

  // Update local state when initialContent changes (e.g., after fetch)
  useEffect(() => {
    setValue(initialContent);
  }, [initialContent]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = async (query: string) => {
    try {
      const response = await fetch("https://challenge.surfe.com/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const users = await response.json();

      const filtered = users
        .filter((user: User) =>
          user.first_name.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a: User, b: User) => {
          const aStartsWith = a.first_name
            .toLowerCase()
            .startsWith(query.toLowerCase());
          const bStartsWith = b.first_name
            .toLowerCase()
            .startsWith(query.toLowerCase());
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.first_name.localeCompare(b.first_name);
        })
        .slice(0, 5);

      setMentionUsers(filtered);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const saveContentAfterDelay = (content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(noteId, content);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const noteText = e.target.value;
    setValue(noteText);
    saveContentAfterDelay(noteText);

    const position = e.target.selectionStart;
    setCursorPosition(position);

    const lastChar = noteText.charAt(position - 1);
    if (lastChar === "@") {
      setShowMentions(true);
      searchUsers("");
    } else if (showMentions) {
      const lastAtPos = noteText.lastIndexOf("@", position);
      if (lastAtPos === -1 || position <= lastAtPos) {
        setShowMentions(false);
      } else {
        const mentionText = noteText.slice(lastAtPos + 1, position);
        searchUsers(mentionText);
      }
    }
  };

  const insertMention = (username: string) => {
    const beforeMention = value.slice(
      0,
      value.lastIndexOf("@", cursorPosition)
    );
    const afterMention = value.slice(cursorPosition);
    const newNote = `${beforeMention}@${username} ${afterMention}`;
    setValue(newNote);
    setShowMentions(false);
    saveContentAfterDelay(newNote);
  };

  return (
    <div className={styles.note} id={`note-${noteId}`}>
      <div className={styles.noteHeader}>
        <span className={styles.noteTitle}>Note Title</span>
        <span className={styles.lastUpdated}>
          Last updated:{" "}
          {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
        </span>
      </div>
      <textarea
        value={value}
        placeholder="add a note"
        onChange={handleChange}
        className={styles.textarea}
      />

      {showMentions && mentionUsers.length > 0 && (
        <div className={styles.mentionsDropdown}>
          {mentionUsers.map((user, index) => (
            <div
              key={index}
              className={styles.mentionItem}
              onClick={() => insertMention(user.first_name)}
            >
              {user.first_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Note;
