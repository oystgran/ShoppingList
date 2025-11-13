<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Shopping List</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Input for nytt item -->
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
} from "@ionic/vue";

import { ref, computed } from "vue";

interface Item {
  id: number;
  text: string;
  done: boolean;
}

const newItem = ref("");
const items = ref<Item[]>([]);

function addItem() {
  const text = newItem.value.trim();
  if (!text) return;

  items.value.push({
    id: Date.now(),
    text,
    done: false,
  });

  newItem.value = "";
}

function toggle(item: Item) {
  item.done = !item.done;
}

const undoneItems = computed(() => items.value.filter((i) => !i.done));
const doneItems = computed(() => items.value.filter((i) => i.done));
</script>
