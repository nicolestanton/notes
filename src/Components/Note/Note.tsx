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

type User = {
  id: number;
  first_name: string;
};

export const Note = () => {
  const [noteData, setNoteData] = useState<Note>({ id: null, value: "" });
  const [latestNote, setLatestNote] = useState<NoteResponse | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SESSION_NAME = "session4";

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await fetch(
        `https://challenge.surfe.com/${SESSION_NAME}/notes`
      );
      const data = await response.json();
      setLatestNote(data[0]);
      // Set initial note value when fetched
      if (data[0]) {
        setNoteData({ id: data[0].id, value: data[0].body });
      }
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
      saveNote(content);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const noteText = e.target.value;
    setNoteData({ id: noteData.id, value: noteText });
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
    const beforeMention = noteData.value.slice(
      0,
      noteData.value.lastIndexOf("@", cursorPosition)
    );
    const afterMention = noteData.value.slice(cursorPosition);
    const newNote = `${beforeMention}@${username} ${afterMention}`;
    setNoteData({ id: noteData.id, value: newNote });
    setShowMentions(false);
    saveContentAfterDelay(newNote);
  };

  return (
    <div className={styles.note}>
      <span>Note</span>
      <textarea
        value={noteData.value}
        placeholder="add a note"
        onChange={handleChange}
      />

      {showMentions && mentionUsers.length > 0 && (
        <div>
          {mentionUsers.map((user, index) => (
            <div key={index} onClick={() => insertMention(user.first_name)}>
              {user.first_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Note;