<template>
  <ion-page>
    <ion-header style="box-shadow: none">
      <ion-toolbar class="px-4 py-2">
        <MenuSignOut />
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div id="container" class="mx-10">
       
        <h1>ACAAAACADS</h1>
      
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonPage,
  IonToolbar,
  IonHeader,
} from "@ionic/vue";

import MenuSignOut from "../components/menu/MenuSignOut.vue";

export default {
  components: {
    MenuSignOut,
    IonToolbar,
    IonHeader,
    IonContent,
    IonPage,
    
  },

  

  data: () => ({
    
  })
}

</script>

<style scoped>
#container a {
  text-decoration: none;
}

ion-content {
  --background: #fff;
}

</style>
