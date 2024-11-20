<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar
        slot="bottom"
        :class="{
          'px-2': !menuStore.isMoreMenu,
          'px-3': menuStore.isMoreMenu,
          isMobile: isMobile,
        }"
        :style="{
          width: !menuStore.isMoreMenu && !isMobile ? '56px' : '220px',
          borderRight: !menuStore.isMoreMenu
            ? 'none'
            : '2px solid rgb(0 0 0 / 4%)',
          boxShadow: !menuStore.isMoreMenu
            ? ' 0 10px 20px rgba(0, 0, 0, .12)'
            : 'none',
          left: !menuStore.isMoreMenu ? '-260px' : 0,
        }"
        @mouseenter="onHover"
        @mouseleave="onLeave"
      >
        <div
          class="ion-text-center mb-7 d-flex align-center gap-3 pt-4 w-100"
          style="height: 56px"
        >
          <img
            v-if="!menuStore.isMoreMenu && !isMobile"
            src="@/assets/logos/avatar.svg"
            class="cursor-pointer avatar"
          />
          <template v-else>
            <img src="@/assets/logos/logo-small.svg" class="cursor-pointer" />
            <div class="d-flex align-center">
              <span
                class="text-20 font-weight-bold text-color text-uppercase white-space-nowrap"
                >StayNow Hub
              </span>
              <img
                v-if="isMobile"
                src="@/assets/logo-menu/close-black.svg"
                class="cursor-pointer"
                @click="menuStore.isMoreMenu = !menuStore.isMoreMenu"
              />
            </div>
          </template>
        </div>
        <div
          class="w-100 d-flex flex-column justify-start align-start"
          style="gap: 10px"
        >
          <!-- Sử dụng v-for để lặp qua danh sách tab -->
          <ion-tab-button
            v-for="(tab, index) in tabs"
            :key="index"
            :tab="tab.name"
            :href="tab.href"
            @click="setActiveTab(tab.name, tab.title)"
            :class="{
              active:
                (menuStore.activeTab == tab.name && isMobile) ||
                (menuStore.activeTab == tab.name && menuStore.isMoreMenu),
            }"
            @mouseover="hoveredTab = tab.name"
            @mouseleave="hoveredTab = null"
          >
            <ion-label class="d-flex align-center gap-2 w-100 ml-2">
              <img
                class="icon-send"
                :src="
                  hoveredTab === tab.name && !isActiveTab(tab.name)
                    ? tab.active
                    : isActiveTab(tab.name) && menuStore.isMoreMenu
                    ? tab.default
                    : isActiveTab(tab.name) && !menuStore.isMoreMenu
                    ? tab.active
                    : tab.hover
                "
              />
              <span
                v-if="menuStore.isMoreMenu || isMobile"
                class="font-weight-semibold fs-14 text-color min-w-150 text-left"
                :class="{ 'text-white': menuStore.activeTab == tab.name }"
                >{{ tab.title }}</span
              >
            </ion-label>
          </ion-tab-button>

         

        
        </div>
      </ion-tab-bar>

      <div
        v-if="menuStore.isMoreMenu && isMobile"
        style="width: 100%; background: #c9c5c5"
      ></div>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonLabel,
} from "@ionic/vue";
import icTableTemplateBack from "@/assets/logo-menu/ic-table-template-black.svg";
import icBaseTemplateBlack from "@/assets/logo-menu/ic-base-template-black.svg";
import icFormTemplateBlack from "@/assets/logo-menu/ic-form-template-black.svg";
import icWorkflowBlack from "@/assets/logo-menu/ic-workflow-black.svg";
import icWebhookBlack from "@/assets/logo-menu/ic-webhook-black.svg";
import icDataTemplateBlack from "@/assets/logo-menu/ic-data-template-black.svg"
import icModuleTemplateBlack from "@/assets/logo-menu/ic-module-template-black.svg"

import icTableTemplateWhite from "@/assets/logo-menu/ic-table-template-white.svg";
import icBaseTemplateWhite from "@/assets/logo-menu/ic-base-template-white.svg";
import icFormTemplateWhite from "@/assets/logo-menu/ic-form-template-white.svg";
import icWorkflowWhite from "@/assets/logo-menu/ic-workflow-white.svg";
import icWebhookWhite from "@/assets/logo-menu/ic-webhook-white.svg";
import icDataTemplateWhite from "@/assets/logo-menu/ic-data-template-white.svg"
import icModuleTemplateWhite from "@/assets/logo-menu/ic-module-template-white.svg"

import icTableTemplatePrimary from "@/assets/logo-menu/ic-table-template-primary.svg";
import icBaseTemplatePrimary from "@/assets/logo-menu/ic-base-template-primary.svg";
import icFormTemplatePrimary from "@/assets/logo-menu/ic-form-template-primary.svg";
import icWorkflowPrimary from "@/assets/logo-menu/ic-workflow-primary.svg";
import icWebhookPrimary from "@/assets/logo-menu/ic-webhook-primary.svg";
import icDataTemplatePrimary from "@/assets/logo-menu/ic-data-template-primary.svg"
import icModuleTemplatePrimary from "@/assets/logo-menu/ic-module-template-primary.svg"



import arrowDownBlack from "@/assets/arrows/arrow-down-black.svg";
import arrowDownPrimary from "@/assets/arrows/arrow-down-primary.svg";
import arrowDownWhite from "@/assets/arrows/arrow-down-white.svg";
import arrowRightBlack from "@/assets/arrows/arrow-right-black.svg";
import arrowRightPrimary from "@/assets/arrows/arrow-right-primary.svg";
import arrowRightWhite from "@/assets/arrows/arrow-right-white.svg";

import dotBlack from "@/assets/logo-menu/dot-black.svg";
import dotPrimary from "@/assets/logo-menu/dot-primary.svg";

import deviceMixin from "@/utils/deviceMixin";

import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/assets/stores/auth";
import { useUserStore } from "@/assets/stores/user";
import { useMenuStore } from "@/assets/stores/menuStore";

export default {
  mixins: [deviceMixin],
  name: "StayNow",
  components: {
    IonPage,
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonLabel,
  },

  setup() {
    const isMobile = ref(false);
    const isManageTab = ref(false);
    const openPosts = ref(false);
    const openRecruitment = ref(false);
    const hoveredTab = ref<string | null>(null);

    const route = useRoute();
    const router = useRouter();
    const userID = ref("");
    const imageURL = ref<string | null>("");
    const menuStore = useMenuStore();

    const activeTab = ref("home");
    const activePost = ref("");
    const orderNotFound = ref(false);
    const tabs = [
      {
        name: "home",
        href: "/home",
        hover: icTableTemplateBack,
        active: icTableTemplatePrimary,
        default: icTableTemplateWhite,
        title: "Trang chủ",
      },
      {
        name: "contact",
        href: "/contact",
        hover: icBaseTemplateBlack,
        active: icBaseTemplatePrimary,
        default: icBaseTemplateWhite,
        title: "Contact",
      },

      {
        name: "form-template-view",
        href: "/form-template-view",
        hover: icFormTemplateBlack,
        active: icFormTemplatePrimary,
        default: icFormTemplateWhite,
        title: "Form Template",
      },
      {
        name: "workflow-view",
        href: "/workflow-view",
        hover: icWorkflowBlack,
        active: icWorkflowPrimary,
        default: icWorkflowWhite,
        title: "Workflow",
      },
      {
        name: "webhook",
        href: "/webhook",
        hover: icWebhookBlack,
        active: icWebhookPrimary,
        default: icWebhookWhite,
        title: "Webhook",
      },
      {
        name: "data-template-view",
        href: "/data-template-view",
        hover: icDataTemplateBlack,
        active: icDataTemplatePrimary,
        default: icDataTemplateWhite,
        title: "Data Template",
      },
      {
        name: "module-template-view",
        href: "/module-template-view",
        hover: icModuleTemplateBlack,
        active: icModuleTemplatePrimary,
        default: icModuleTemplateWhite,
        title: "Module Template",
      },
    ];


    // Hover
    const onHover = () => {
      if (!isMobile.value) {
        menuStore.moreMenu(true);
      }
    };

    // Leave
    const onLeave = () => {
      if (menuStore.isRemoveHover) {
        return;
      }
      if (!isMobile.value) {
        menuStore.moreMenu(false);
      }
    };

    const handleManageTab = () => {
      menuStore.moreMenu(true);
      menuStore.isRemoveHover = true;
      menuStore.setManageTab(true);
      menuStore.setActiveTab("manager");
      // openPosts.value = !openPosts.value;
      menuStore.openPostTab(!menuStore.isOpenPost);
    };

    // Điều hướng
    const navigateToPost = (tabActive: string, tabName: string) => {
      if (isMobile.value) {
        menuStore.moreMenu(false);
      }
      // Điều hướng tới route /post và đóng menu
      menuStore.activePost = tabActive;

      menuStore.setActivePost(`${tabActive}`); // Đặt tab hiện tại là "recruitment"
      router.push(`${tabName}`);
    };

    // Tab được chọn
    const isActiveTab = (tabName: string) => {
      return menuStore.activeTab === tabName;
    };

    // Tab được chọn
    const setActiveTab = (tabName: string, title: string) => {
      if (isMobile.value) {
        menuStore.moreMenu(false);
      } else {
        menuStore.moreMenu(true);
      }

      menuStore.setActiveTab(tabName);
      menuStore.isRemoveHover = true;
      openRecruitment.value = false;
      menuStore.openPostTab(false);
      menuStore.setManageTab(false);
      menuStore.activeTab === tabName;
      menuStore.activePost = "";

      document.title = title;
      router.push(`/${tabName}`);
    };

    // Đặt activeTab dựa trên đường dẫn hiện tại
    onMounted(() => {
      useAuthStore().checkTokenValid();
      const currentRoute = route.path; // Lấy đường dẫn hiện tại
      const tab = tabs.find((tab) => currentRoute.startsWith(tab.href)); // Kiểm tra nếu đường dẫn bắt đầu bằng href
      if (tab) {
        menuStore.activeTab = tab.name; // Cập nhật activeTab nếu tìm thấy
      } else {
        menuStore.activeTab = currentRoute;
      }

      userID.value = useAuthStore().user_id;
      imageURL.value = useUserStore().imageURL;
    });

    return {
      setActiveTab,
      isActiveTab,
      navigateToPost,
      onHover,
      onLeave,
      handleManageTab,
      route,
      activeTab,
      activePost,
      tabs,
      orderNotFound,
      isMobile,
      isManageTab,
      userID,
      imageURL,
      menuStore,
      openPosts,
      openRecruitment,
      hoveredTab,
      arrowDownBlack,
      arrowDownPrimary,
      arrowDownWhite,
      arrowRightBlack,
      arrowRightPrimary,
      arrowRightWhite,
      dotBlack,
      dotPrimary,
    };
  },
};
</script>

<style scoped>
ion-toolbar {
  --border-color: transparent !important;
}

ion-header {
  box-shadow: none !important;
  padding: 7px 0;
  background: #fff;
}
ion-tabs {
  flex-direction: row-reverse !important;
}
ion-tab-bar {
  top: 0;
  bottom: 0;
  z-index: 99;
  flex-direction: column;
  margin-top: 0 !important;
  border: none;
  height: 100%;
  justify-content: flex-start !important;
  transition: 0.3s ease-in;
  /* transition: left 0.5s ease-in-out; */
}

ion-tab-bar.mobile .tab-button {
  display: flex;
}

ion-tab-button {
  display: block;
  max-width: unset;
  height: 40px;
  flex: none;
  border-radius: 4px;
  width: 100%;
  --ripple-color: #471BC4;
}

ion-tab-button:hover ion-label span {
  color: #471BC4;
}

ion-tab-button.active {
  background: #471BC4;
}

.avatar {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  max-width: 56px;
  max-height: 56px;
  border-radius: 8px;
}

.icon-send {
  max-width: 24px !important;
  min-width: 24px !important;
}

ion-modal {
  --border-radius: 0;
  --box-shadow: none;
  margin-top: 80px;
  --width: 100%;
  --max-height: 100%;
}

ion-modal::part(backdrop) {
  background: #000;
  opacity: 0.8;
}

.isMobile {
  position: absolute;
  /* left: -200px; */
}

.min-w-150 {
  min-width: 150px;
}

.min-w-130 {
  min-width: 130px;
}
</style>
