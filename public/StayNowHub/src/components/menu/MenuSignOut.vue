<template>
  <div class="d-flex align-center justify-space-between px-3">
    <img
      class="cursor-pointer"
      style="width: 24px; height: 24px"
      src="@/assets/images/icon/ic-menu-default.svg"
      @click="handleMoreMenu"
    />

  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { useMenuStore } from "../../assets/stores/menuStore";

export default {

  setup() {
    const menuSignOut = ref(false);
    const menuStore = useMenuStore();

    const handleMoreMenu = () => {
      menuStore.moreMenu(!menuStore.isMoreMenu);
      menuStore.isRemoveHover = !menuStore.isRemoveHover;
    };

    return {
      menuSignOut,
      handleMoreMenu,
    };
  },
};
</script>

<style scoped>
.avatar {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  max-width: 56px;
  max-height: 56px;
  border-radius: 8px;
}

</style>
