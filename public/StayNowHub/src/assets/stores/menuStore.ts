// stores/menuStore.ts
import { defineStore } from "pinia";

export const useMenuStore = defineStore("menuStore", {
  state: () => ({
    isMoreMenu: false,
    openMenu: false, // Trạng thái menu đóng/mở
    activePost: "", // Tab mặc định
    activeTab: "table-template-view", // Tab mặc định
    isRemoveHover: false,
    isManageTab: false,
    isOpenPost: false
  }),
  actions: {   
    // Tab chính
    setActiveTab(tab: string) {
      this.activeTab = tab;
    },

    // Tab tin đăng trong manage
    setActivePost(tab: string) {
      this.activePost = tab;
    },

    // Tab quản lý
    setManageTab(value: boolean) {
      this.isManageTab = value;
    },

    // Đóng mở tab tin đăng trong manage
    openPostTab(value: boolean) {
      this.isOpenPost = value;
    },

    // Mở rộng menu
    moreMenu(value: boolean) {
      this.isMoreMenu = value
    }
  },
});
