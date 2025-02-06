import styles from "./page.module.css";
import { Note } from "@/Components/Note/Note";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Note />
      </main>
    </div>
  );
}
