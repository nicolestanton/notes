"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./Note.module.scss";
import { filterAndSortUsers } from "@/utils/users/users";
import { User } from "@/types";
import { getUsers } from "@/endpoints";
import { Note as NoteProps } from "@/types";

export const Note = ({ id, body, lastUpdated, onUpdate }: NoteProps) => {
  const [value, setValue] = useState(body);

  // Sync value with body when it changes
  useEffect(() => {
    setValue(body);
  }, [body]);

  const [showMentions, setShowMentions] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = async (query: string) => {
    try {
      const users = await getUsers();

      const filtered = filterAndSortUsers(users, query, 5);

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
      if (onUpdate) {
        onUpdate(id, content);
      }
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

  const renderFormattedContent = () => {
    if (!value) return null;

    const parts = value.split(/(@\S+)/g);
    return parts.map((part, index) => {
      if (!part) return null;
      if (part.startsWith("@")) {
        return (
          <span key={index} className={styles.mention}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={styles.note} id={`note-${id}`}>
      <div className={styles.noteHeader}>
        <span className={styles.noteTitle}>Note Title</span>
        <span className={styles.lastUpdated}>
          Last updated:{" "}
          <span data-testid="last-updated-date">
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
          </span>
        </span>
      </div>

      <div className={styles.editorContainer}>
        {/* Base textarea for editing */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          className={styles.textarea}
        />

        {/* Styled overlay */}
        <div className={styles.overlay} data-placeholder="add a note">
          {renderFormattedContent()}
        </div>

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
    </div>
  );
};

export default Note;
