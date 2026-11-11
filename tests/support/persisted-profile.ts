import type { Page } from "@playwright/test";
import type { Progress } from "../../src/types";

// Read the committed source of truth, not the asynchronous localStorage mirror.
export async function readPersistedProfile(
  page: Page,
): Promise<Progress | undefined> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("cyberpath.learning.v1", 1);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    try {
      return await new Promise((resolve, reject) => {
        const r = db
          .transaction("meta", "readonly")
          .objectStore("meta")
          .get("head");
        r.onsuccess = () => resolve(r.result?.profile);
        r.onerror = () => reject(r.error);
      });
    } finally {
      db.close();
    }
  });
}
