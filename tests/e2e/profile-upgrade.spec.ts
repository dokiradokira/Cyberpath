import { test, expect } from "@playwright/test";

test("older IndexedDB profiles gain records for the new lessons", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/progress");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("cyberpath.learning.v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const head = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const request = db
        .transaction("meta", "readonly")
        .objectStore("meta")
        .get("head");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const profile = head.profile as {
      contentVersion: number;
      lessons: Record<string, unknown>;
    };
    for (const id of ["how-computers-work", "operating-systems-basics", "linux-command-line"])
      delete profile.lessons[id];
    profile.contentVersion = 1;
    await new Promise<void>((resolve, reject) => {
      const request = db
        .transaction("meta", "readwrite")
        .objectStore("meta")
        .put({ ...head, profile, revision: Number(head.revision) + 1 });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    db.close();
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "学习进度" })).toBeVisible();
  await page.goto("/");
  await expect(page.locator(".path-list a")).toHaveCount(6);
  expect(errors).toEqual([]);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cyberpath.v1") ?? "{}"),
  );
  expect(stored.contentVersion).toBe(2);
  expect(Object.keys(stored.lessons)).toHaveLength(6);
});
