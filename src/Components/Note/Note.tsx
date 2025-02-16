import React from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./Note.module.scss";
import { filterAndSortUsers } from "@/utils/users/users";
import { User } from "@/types";
import { getUsers } from "@/endpoints";
import { Note as NoteProps } from "@/types";

export const Note = ({
  id,
  body,
  lastUpdated,
  onUpdate,
  disabled,
}: NoteProps) => {
  const [value, setValue] = useState(body);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(body);
  }, [body]);

  // Sync scroll positions between textarea and overlay
  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;

    if (!textarea || !overlay) return;

    const handleScroll = () => {
      if (overlay && textarea) {
        overlay.scrollTop = textarea.scrollTop;
      }
    };

    textarea.addEventListener("scroll", handleScroll);

    // Proper cleanup function
    return () => {
      textarea.removeEventListener("scroll", handleScroll);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const searchUsers = async (query: string) => {
    try {
      const users = await getUsers();
      const filtered = filterAndSortUsers(users, query, 5);
      setMentionUsers(filtered);
      setSelectedIndex(0); // Reset selection when search results change
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const saveContentAfterDelay = (content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (onUpdate) {
        onUpdate(id, content);
      }
      // Clear the ref after update
      saveTimeoutRef.current = null;
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const noteText = e.target.value;
    setValue(noteText);
    saveContentAfterDelay(noteText);

    const position = e.target.selectionStart;
    setCursorPosition(position);

    // Get the text from the last @ symbol to the cursor position
    const textBeforeCursor = noteText.slice(0, position);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    // Only show mentions if:
    // 1. We just typed @ (lastChar is @)
    // 2. OR we're in the middle of a mention (there's an @ before cursor with no space after it)
    if (lastAtPos !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
      const hasSpaceAfterAt = /\s/.test(textAfterAt);

      if (position - lastAtPos === 1) {
        // Just typed @
        setShowMentions(true);
        searchUsers("");
      } else if (!hasSpaceAfterAt && position > lastAtPos) {
        // In the middle of typing a mention
        setShowMentions(true);
        searchUsers(textAfterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username: string, lastname: string) => {
    const beforeMention = value.slice(
      0,
      value.lastIndexOf("@", cursorPosition)
    );
    const afterMention = value.slice(cursorPosition);
    const newNote = `${beforeMention}@${username}-${lastname} ${afterMention}`;
    setValue(newNote);
    setShowMentions(false);
    saveContentAfterDelay(newNote);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions || mentionUsers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < mentionUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        const selectedUser = mentionUsers[selectedIndex];
        if (selectedUser) {
          insertMention(selectedUser.first_name, selectedUser.last_name);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowMentions(false);
        break;
      case "Tab":
        if (showMentions) {
          e.preventDefault();
          const selectedUser = mentionUsers[selectedIndex];
          if (selectedUser) {
            insertMention(selectedUser.first_name, selectedUser.last_name);
          }
        }
        break;
    }
  };

  const renderFormattedContent = () => {
    if (!value) return null;

    const parts = value.split(/(@\S+)/g);
    return parts.map((part, index) => {
      if (!part) return null;
      if (part.startsWith("@")) {
        return (
          <span key={index} className={styles.mentionWrapper}>
            <span className={styles.mentionText}>{part}</span>
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
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "-"}
          </span>
        </span>
      </div>

      <div className={styles.editorContainer}>
        <textarea
          placeholder="Add a note"
          disabled={disabled}
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={styles.textarea}
          aria-label="Note content"
          aria-describedby={showMentions ? "mentions-instructions" : undefined}
          aria-expanded={showMentions}
          aria-controls={showMentions ? "mentions-list" : undefined}
          aria-activedescendant={
            showMentions ? `mention-item-${selectedIndex}` : undefined
          }
          role="combobox"
        />
        <div
          ref={overlayRef}
          className={styles.overlay}
          data-placeholder="add a note"
          aria-hidden="true"
        >
          {renderFormattedContent()}
        </div>

        {showMentions && mentionUsers.length > 0 && (
          <>
            <div id="mentions-instructions" className={styles.srOnly}>
              Use up and down arrow keys to navigate suggestions. Press Enter to
              select.
            </div>
            <div
              ref={mentionsRef}
              className={styles.mentionsDropdown}
              id="mentions-list"
              role="listbox"
              aria-label="User suggestions"
            >
              {mentionUsers.map((user, index) => (
                <div
                  key={index}
                  id={`mention-item-${index}`}
                  className={`${styles.mentionItem} ${
                    index === selectedIndex ? styles.selected : ""
                  }`}
                  onClick={() => insertMention(user.first_name, user.last_name)}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  {user.first_name}-{user.last_name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Note;
