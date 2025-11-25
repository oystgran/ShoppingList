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
          @keyup.enter="addList"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-input
          v-model="newItem"
          placeholder="Legg til vare…"
          @keyup.enter="addItem"
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

const lists = ref<ShoppingList[]>([]);

const activeListId = ref<number | string>("");

interface Item {
  id: number;
  text: string;
  done: boolean;
}

interface ShoppingList {
  id: number;
  name: string;
  items: Item[];
}

const newItem = ref("");
const newListName = ref("");
const isDeleteAlertOpen = ref(false);
const isAddItemAlertOpen = ref(false);

const undoneItems = computed(() =>
  activeList.value ? activeList.value.items.filter((i) => !i.done) : []
);

const doneItems = computed(() =>
  activeList.value ? activeList.value.items.filter((i) => i.done) : []
);

function addList() {
  const name = newListName.value.trim();
  if (!name) return;

  const id = Date.now();
  lists.value.push({
    id,
    name,
    items: [],
  });

  activeListId.value = id;
  newListName.value = "";
}

function deleteActiveList() {
  const index = lists.value.findIndex((list) => list.id === activeListId.value);
  if (index === -1) return;

  lists.value.splice(index, 1);

  if (lists.value.length > 0) {
    activeListId.value = lists.value[0].id;
  } else {
    activeListId.value = "";
  }
}

function openDeleteAlert() {
  if (!activeList.value) return;
  isDeleteAlertOpen.value = true;
}

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

function deleteItem(item: Item) {
  const list = activeList.value;
  if (!list) return;

  const index = list.items.findIndex((i) => i.id === item.id);
  if (index === -1) return;

  list.items.splice(index, 1);
}

const activeList = computed(() => {
  return lists.value.find((list) => list.id === activeListId.value);
});

function addItem() {
  const list = activeList.value;
  const text = newItem.value.trim();

  if (!list) {
    isAddItemAlertOpen.value = true;
    return;
  }

  if (!text) return;

  list.items.push({
    id: Date.now(),
    text,
    done: false,
  });

  newItem.value = "";
}

onMounted(async () => {
  const loaded = await loadListsFromFile();

  if (loaded && loaded.length > 0) {
    lists.value = loaded;
    activeListId.value = loaded[0].id;
  } else {
    activeListId.value = "";
  }
});

function toggle(item: Item) {
  item.done = !item.done;
}

watch(
  lists,
  (value) => {
    saveListsToFile(value);
  },
  { deep: true }
);
</script>
