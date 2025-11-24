/* 
Storage.ts, inspired from Capacitor Filesystem examples at 
https://capacitorjs.com/docs/apis/filesystem
*/

import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

// Interface for a single item in a shopping list
export interface StoredItem {
  id: number;
  text: string;
  done: boolean;
}

// Interface for a shopping list containing multiple items

export interface StoredShoppingList {
  id: number;
  name: string;
  items: StoredItem[];
}

// File name to store the shopping lists
const FILE_NAME = "shopping_lists.json";

// Function to save shopping lists to a file

export async function saveListsToFile(lists: StoredShoppingList[]) {
  await Filesystem.writeFile({
    path: FILE_NAME,
    data: JSON.stringify(lists),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  });
}

/*
Function to load shopping lists from a file. 
Checks if data is a string or Blob and handles accordingly.
This ensures compatibility across different platforms.
 */

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
