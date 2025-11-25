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
   Refs og datastruktur
--------------------------------------------------------- */

// Alle lister lagres her
const lists = ref<ShoppingList[]>([]);

// ID-en til lista som er valgt i segmentet
const activeListId = ref<number | string>("");

// Type for hvert item i lista
interface Item {
  id: number;
  text: string;
  done: boolean; // true = kjøpt, false = ukjøpt
}

// Type for en hel handleliste
interface ShoppingList {
  id: number;
  name: string;
  items: Item[];
}

// Input-feltene for ny liste og nytt item
const newItem = ref("");
const newListName = ref("");

// Alert-styring
const isDeleteAlertOpen = ref(false);
const isAddItemAlertOpen = ref(false);

/* ---------------------------------------------------------
   Computed properties
--------------------------------------------------------- */

// Returnerer lista som er aktiv (eller undefined hvis ingen)
const activeList = computed(() => {
  return lists.value.find((list) => list.id === activeListId.value);
});

// Items som ikke er kjøpt
const undoneItems = computed(() =>
  activeList.value ? activeList.value.items.filter((i) => !i.done) : []
);

// Items som er kjøpt
const doneItems = computed(() =>
  activeList.value ? activeList.value.items.filter((i) => i.done) : []
);

/* ---------------------------------------------------------
   Legge til ny liste
--------------------------------------------------------- */

function addList() {
  const name = newListName.value.trim();
  if (!name) return;

  // Bruker timestamp som unik ID
  const id = Date.now();

  lists.value.push({
    id,
    name,
    items: [],
  });

  // Velg den nye lista automatisk
  activeListId.value = id;

  // Tøm inputfelt
  newListName.value = "";
}

/* ---------------------------------------------------------
   Slette en liste (bekreftes via popup)
--------------------------------------------------------- */

function deleteActiveList() {
  // Finn lista basert på ID
  const index = lists.value.findIndex((list) => list.id === activeListId.value);
  if (index === -1) return;

  // Fjern lista
  lists.value.splice(index, 1);

  // Velg en ny liste hvis det finnes noen igjen
  if (lists.value.length > 0) {
    activeListId.value = lists.value[0].id;
  } else {
    activeListId.value = "";
  }
}

// Åpner sletteliste-popup
function openDeleteAlert() {
  if (!activeList.value) return;
  isDeleteAlertOpen.value = true;
}

// Knappene i sletteliste-popup
const alertButtons = [
  {
    text: "Avbryt",
    role: "cancel",
  },
  {
    text: "Slett",
    role: "destructive",
    handler: () => {
      deleteActiveList();
    },
  },
];

/* ---------------------------------------------------------
   Slette et item
--------------------------------------------------------- */

function deleteItem(item: Item) {
  const list = activeList.value;
  if (!list) return;

  const index = list.items.findIndex((i) => i.id === item.id);
  if (index === -1) return;

  list.items.splice(index, 1);
}

/* ---------------------------------------------------------
   Legge til nytt item
--------------------------------------------------------- */

function addItem() {
  const list = activeList.value;
  const text = newItem.value.trim();

  // Kan ikke legge til item uten aktiv liste
  if (!list) {
    isAddItemAlertOpen.value = true;
    return;
  }

  // Ikke legg til tom tekst
  if (!text) return;

  // Legg til nytt item i lista
  list.items.push({
    id: Date.now(),
    text,
    done: false,
  });

  // Tøm inputfelt
  newItem.value = "";
}

/* ---------------------------------------------------------
   Fiks for å forhindre at fokus hopper til neste liste 
   ved Enter trykk på Android keyboardet
--------------------------------------------------------- */

// Brukes for å unngå at vi kaller addList() to ganger
const ignoreNextListBlur = ref(false);

// Kalles når bruker trykker Enter (der det faktisk sendes keyup)
function onListEnter(event: any) {
  ignoreNextListBlur.value = true;

  // Prøv å stoppe default oppførsel
  if (event?.preventDefault) event.preventDefault();
  if (event?.stopPropagation) event.stopPropagation();

  addList();
}

// Kalles når feltet mister fokus ved Enter trykk på Android on screen keyboard
function onListBlur() {
  // Hvis vi nettopp håndterte Enter, skipper vi blur-kallet
  if (ignoreNextListBlur.value) {
    ignoreNextListBlur.value = false;
    return;
  }

  addList();
}

/* ---------------------------------------------------------
   Laste inn data når komponenten lastes
--------------------------------------------------------- */

onMounted(async () => {
  // Hent lagrede lister fra fil via Capacitor Filesystem
  const loaded = await loadListsFromFile();

  if (loaded && loaded.length > 0) {
    lists.value = loaded;
    activeListId.value = loaded[0].id; // Velg første liste
  } else {
    activeListId.value = "";
  }
});

/* ---------------------------------------------------------
   Toggle item (kjøpt ↔ ukjøpt)
--------------------------------------------------------- */

function toggle(item: Item) {
  item.done = !item.done;
}

/* ---------------------------------------------------------
   Lagre lister automatisk når de endres
--------------------------------------------------------- */

watch(
  lists, // det vi overvåker
  (value) => {
    saveListsToFile(value); // lagre til fil
  },
  { deep: true } // overvåk nested endringer i objekter
);
</script>
