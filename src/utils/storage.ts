// src/utils/storage.ts
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export interface StoredItem {
  id: number;
  text: string;
  done: boolean;
}

export interface StoredShoppingList {
  id: number;
  name: string;
  items: StoredItem[];
}

const FILE_NAME = "shopping_lists.json";

export async function saveListsToFile(lists: StoredShoppingList[]) {
  await Filesystem.writeFile({
    path: FILE_NAME,
    data: JSON.stringify(lists),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  });
}

export async function loadListsFromFile(): Promise<
  StoredShoppingList[] | null
> {
  try {
    const result = await Filesystem.readFile({
      path: FILE_NAME,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });

    let text: string;

    if (typeof result.data === "string") {
      text = result.data;
    } else {
      text = await result.data.text();
    }
    return JSON.parse(text) as StoredShoppingList[];
  } catch (error) {
    return null;
  }
}
