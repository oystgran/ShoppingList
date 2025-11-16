<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Shopping List</ion-title>
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
        <ion-button slot="end" @click="addList"> Legg til </ion-button>
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
          {{ item.text }}
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
          <s>{{ item.text }}</s>
        </ion-item>
      </ion-list>
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
} from "@ionic/vue";

import { ref, computed } from "vue";

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

const lists = ref<ShoppingList[]>([
  { id: 1, name: "Dagligvarer", items: [] },
  { id: 2, name: "Hytte", items: [] },
]);

const activeListId = ref(1);

const activeList = computed(() => {
  return lists.value.find((list) => list.id === activeListId.value)!;
});

function addItem() {
  const list = activeList.value;
  const text = newItem.value.trim();
  if (!text) return;

  list.items.push({
    id: Date.now(),
    text,
    done: false,
  });

  newItem.value = "";
}

function toggle(item: Item) {
  item.done = !item.done;
}

const undoneItems = computed(() =>
  activeList.value.items.filter((i) => !i.done)
);
const doneItems = computed(() => activeList.value.items.filter((i) => i.done));
</script>
