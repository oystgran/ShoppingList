<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Shopping List</ion-title>

        <ion-buttons slot="end">
          <ion-button @click="openDeleteAlert" :disabled="!activeList">
            <ion-icon :icon="trash" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-segment v-model="activeListId">
        <ion-segment-button
          v-for="list in lists"
          :key="list.id"
          :value="list.id"
        >
          <ion-label>{{ list.name }}</ion-label>
        </ion-segment-button>
      </ion-segment>

      <ion-item>
        <ion-input
          v-model="newListName"
          placeholder="Ny liste…"
          @keyup.enter="onListEnter"
          @ionBlur="onListBlur"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-input
          v-model="newItem"
          placeholder="Legg til vare…"
          @keyup.enter.prevent="addItem"
        ></ion-input>
      </ion-item>

      <!-- Ugjort -->
      <ion-list>
        <ion-list-header>Ukjøpt</ion-list-header>
        <ion-item
          v-for="item in undoneItems"
          :key="item.id"
          button
          @click="toggle(item)"
        >
          <ion-label>
            {{ item.text }}
          </ion-label>
          <ion-button
            slot="end"
            fill="clear"
            color="danger"
            @click.stop="deleteItem(item)"
          >
            <ion-icon :icon="trash" />
          </ion-button>
        </ion-item>
      </ion-list>

      <!-- Ferdig -->
      <ion-list>
        <ion-list-header>Kjøpt</ion-list-header>
        <ion-item
          v-for="item in doneItems"
          :key="item.id"
          button
          @click="toggle(item)"
        >
          <ion-label>
            <s>{{ item.text }}</s>
          </ion-label>
          <ion-button
            slot="end"
            fill="clear"
            color="danger"
            @click.stop="deleteItem(item)"
          >
            <ion-icon :icon="trash" />
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-alert
        :is-open="isDeleteAlertOpen"
        header="Slett liste"
        :message="`Er du sikker på at du vil slette lista «${
          activeList?.name ?? ''
        }»?`"
        :buttons="alertButtons"
        @didDismiss="isDeleteAlertOpen = false"
      />
      <ion-alert
        :is-open="isAddItemAlertOpen"
        header="Ingen liste valgt"
        message="Du må velge eller opprette en liste før du kan legge til en vare."
        :buttons="['OK']"
        @didDismiss="isAddItemAlertOpen = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonList,
  IonListHeader,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonAlert,
} from "@ionic/vue";

import { ref, computed, onMounted, watch } from "vue";
import { saveListsToFile, loadListsFromFile } from "@/utils/storage";
import { trash } from "ionicons/icons";

/* ---------------------------------------------------------
   Refs and data structures
--------------------------------------------------------- */

// All shopping lists are stored here
const lists = ref<ShoppingList[]>([]);

// The ID of the currently selected list (from the segment)
const activeListId = ref<number | string>("");

// Type for each item in a shopping list
interface Item {
  id: number;
  text: string;
  done: boolean; // true = purchased, false = not purchased
}

// Type for an entire shopping list
interface ShoppingList {
  id: number;
  name: string;
  items: Item[];
}

// Input fields for new list and new item
const newItem = ref("");
const newListName = ref("");

// Alert state handling
const isDeleteAlertOpen = ref(false);
const isAddItemAlertOpen = ref(false);

/* ---------------------------------------------------------
   Computed properties
--------------------------------------------------------- */

// Returns the active list (or undefined if none is selected)
const activeList = computed(() => {
  return lists.value.find((list) => list.id === activeListId.value);
});

// Items that are not purchased
const undoneItems = computed(() =>
  activeList.value ? activeList.value.items.filter((i) => !i.done) : []
);

// Items that are purchased
const doneItems = computed(() =>
  activeList.value ? activeList.value.items.filter((i) => i.done) : []
);

/* ---------------------------------------------------------
   Add a new list
--------------------------------------------------------- */

function addList() {
  const name = newListName.value.trim();
  if (!name) return;

  // Use timestamp as unique ID
  const id = Date.now();

  lists.value.push({
    id,
    name,
    items: [],
  });

  // Automatically select the newly created list
  activeListId.value = id;

  // Clear input
  newListName.value = "";
}

/* ---------------------------------------------------------
   Delete the active list (confirmed through popup)
--------------------------------------------------------- */

function deleteActiveList() {
  // Find the list based on ID
  const index = lists.value.findIndex((list) => list.id === activeListId.value);
  if (index === -1) return;

  // Remove the list
  lists.value.splice(index, 1);

  // Select a new list if any exist
  if (lists.value.length > 0) {
    activeListId.value = lists.value[0].id;
  } else {
    activeListId.value = "";
  }
}

// Opens the delete-list confirmation alert
function openDeleteAlert() {
  if (!activeList.value) return;
  isDeleteAlertOpen.value = true;
}

// Buttons for the delete-list popup
const alertButtons = [
  {
    text: "Cancel",
    role: "cancel",
  },
  {
    text: "Delete",
    role: "destructive",
    handler: () => {
      deleteActiveList();
    },
  },
];

/* ---------------------------------------------------------
   Delete an item
--------------------------------------------------------- */

function deleteItem(item: Item) {
  const list = activeList.value;
  if (!list) return;

  const index = list.items.findIndex((i) => i.id === item.id);
  if (index === -1) return;

  list.items.splice(index, 1);
}

/* ---------------------------------------------------------
   Add a new item
--------------------------------------------------------- */

function addItem() {
  const list = activeList.value;
  const text = newItem.value.trim();

  // Cannot add an item without an active list
  if (!list) {
    isAddItemAlertOpen.value = true;
    return;
  }

  // Do not add empty text
  if (!text) return;

  // Add new item to the list
  list.items.push({
    id: Date.now(),
    text,
    done: false,
  });

  // Clear input
  newItem.value = "";
}

/* ---------------------------------------------------------
   Fix to prevent Android keyboard "Enter" from jumping 
   to the next input field instead of adding the list
--------------------------------------------------------- */

// Used to prevent addList() from being called twice
const ignoreNextListBlur = ref(false);

// Called when Enter key is pressed (if keyup event is actually fired)
function onListEnter(event: any) {
  ignoreNextListBlur.value = true;

  // Try to stop default behavior
  if (event?.preventDefault) event.preventDefault();
  if (event?.stopPropagation) event.stopPropagation();

  addList();
}

// Called when the field loses focus due to Android "Done" key
function onListBlur() {
  // If Enter was just handled, skip blur-triggered add
  if (ignoreNextListBlur.value) {
    ignoreNextListBlur.value = false;
    return;
  }

  addList();
}

/* ---------------------------------------------------------
   Load saved data when component loads
--------------------------------------------------------- */

onMounted(async () => {
  // Load saved lists from Capacitor Filesystem
  const loaded = await loadListsFromFile();

  if (loaded && loaded.length > 0) {
    lists.value = loaded;
    activeListId.value = loaded[0].id; // Select first list
  } else {
    activeListId.value = "";
  }
});

/* ---------------------------------------------------------
   Toggle item state (purchased ↔ not purchased)
--------------------------------------------------------- */

function toggle(item: Item) {
  item.done = !item.done;
}

/* ---------------------------------------------------------
   Automatically save lists whenever they change
--------------------------------------------------------- */

watch(
  lists, // what we are watching
  (value) => {
    saveListsToFile(value); // save to file
  },
  { deep: true } // watch nested changes inside objects
);
</script>
