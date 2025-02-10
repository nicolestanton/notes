import styles from "./Error.module.scss";
import { Error as ErrorType } from "@/types";

export const Error = ({ message }: ErrorType) => {
  return <div className={styles.error}>Error: {message}</div>;
};
