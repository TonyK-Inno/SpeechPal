import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("history.db");
  }
  return dbPromise;
}

export interface Conversation {
  id: number;
  name: string;
  date: string; // ISO string
  phrases: string[];
}

export async function initHistoryDB() {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      phrases TEXT NOT NULL
    );
  `);
}

export async function addConversation(
  name: string,
  phrases: string[]
): Promise<void> {
  const db = await getDB();
  const date = new Date().toISOString();
  await db.runAsync(
    "INSERT INTO conversations (name, date, phrases) VALUES (?, ?, ?)",
    [name, date, JSON.stringify(phrases)]
  );
}

export async function getConversations(): Promise<Conversation[]> {
  const db = await getDB();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    date: string;
    phrases: string;
  }>("SELECT * FROM conversations WHERE date >= ? ORDER BY date DESC", [
    sevenDaysAgo,
  ]);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    date: row.date,
    phrases: JSON.parse(row.phrases),
  }));
}

export async function getConversationById(
  id: number
): Promise<Conversation | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    date: string;
    phrases: string;
  }>("SELECT * FROM conversations WHERE id = ?", [id]);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    phrases: JSON.parse(row.phrases),
  };
}

export async function deleteConversation(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM conversations WHERE id = ?", [id]);
}
