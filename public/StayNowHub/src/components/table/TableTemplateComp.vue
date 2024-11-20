<template>
  <ion-card>
    <ion-card-content>
      <ion-grid>
        <ion-row>
          <ion-col class="title-header" v-for="header in headers" :key="header">
            <strong>{{ header }}</strong>
          </ion-col>
        </ion-row>
        <ion-row v-for="(row, rowIndex) in data" :key="rowIndex">
          <ion-col v-for="(cell, cellIndex) in row" :key="cellIndex">
            <template v-if="cell.type === 'text'">
              {{ cell.value }}
            </template>
            <template v-else-if="cell.type === 'language'">
              <div class="language-flags">
                <div
                  v-for="(lang, index) in cell.value.split(',').slice(0, 3)"
                  :key="lang"
                  class="flag-container"
                >
                  <img
                    :src="getFlagUrl(lang.trim())"
                    :alt="`Flag of ${lang.trim()}`"
                    class="language-flag"
                  />
                  <!-- Lớp phủ cho lá cờ thứ 3 -->
                  <div
                    v-if="index === 2 && cell.value.split(',').length > 3"
                    class="overlay"
                  >
                    <span class="more-languages">...</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- <template v-else-if="cell.type === 'checkbox'">
              <ion-checkbox :checked="cell.value"></ion-checkbox>
            </template> -->
            <template v-else-if="cell.type === 'action'">
              <div class="btn-action-group">
                <img
                  src="../../assets/images/icon/ic-edit.svg"
                  alt="Edit"
                  style="width: 24px; height: auto"
                />
                <img
                  src="../../assets/images/icon/ic-remove.svg"
                  alt="Remove"
                  style="width: 24px; height: auto"
                />
              </div>
            </template>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-row>
        <ion-col class="ion-text-center pagination-container">
          <ion-button
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <
          </ion-button>
          <span class="pagination-text"
            >Page {{ currentPage }} of {{ totalPages }}</span
          >
          <ion-button
            class="pagination-button"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            >
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import { LIGHT_THEME } from "@/theme/LightTheme";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButton,
} from "@ionic/vue";
import { ref } from "vue";
interface CellData {
  type: "text" | "language" | "action";
  value: any;
}
import icons from "@/assets/images/icon/icons";

type TableDataRow = CellData[];

export default {
  components: {
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonButton,
  },
  setup() {
    const theme = LIGHT_THEME;
    Object.keys(theme.colors).forEach((color) => {
      const colorValue = theme.colors[color]; // `color` bây giờ là kiểu chuỗi
      if (colorValue) {
        document.documentElement.style.setProperty(`--${color}`, colorValue);
      }
    });

    const getFlagUrl = (languageCode: string) => {
      const flagMap: Record<string, string> = {
        vi_VN: icons.icVietName,
        en_US: icons.icEngLish,
        ko_KR: icons.icVietName,
        ta_IN: icons.icEngLish,
        // Thêm các mã ngôn ngữ khác ở đây
      };
      return flagMap[languageCode] || "/path/to/default-flag.png";
    };
    return {
      theme,
      getFlagUrl,
    };
  },
  props: {
    headers: {
      type: Array as () => string[],
      required: true,
    },
    data: {
      type: Array as () => TableDataRow[],
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  emits: ["changePage"], // Emit event khi thay đổi trang
  methods: {
    changePage(page: number) {
      this.$emit("changePage", page); // Gửi event lên cha để thay đổi trang
    },
  },
};
</script>

<style scoped>
.title-header {
  margin-right: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text_primary);
}
.btn-action-group img:active {
  opacity: 0.3;
}


ion-row {
  color: var(--text_primary);
  font-weight: 400;
  font-size: 14px;
  padding-block: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination-button {
  --color: #fff;
  --background: var(--primary_1);
  --border-radius: 3px;
  --padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
}

.pagination-button[disabled] {
  --color: var(--primary_1);
  --background: #f2f2f2;
}

.pagination-text {
  font-size: 12px;
  font-weight: 400;
  color: var(--text_primary);
  margin: 4px;
}

.language-flags {
  display: flex; /* Sắp xếp các lá cờ theo hàng ngang */
  gap: 4px; /* Khoảng cách giữa các lá cờ */
}

.flag-container {
  position: relative;
  height: 26px;
}

.language-flag {
  width: auto;
  height: auto;
  border-radius: 100%;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Lớp phủ mờ đen */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border-radius: 100%;
}

.more-languages {
  position: relative;
  z-index: 1;
}

</style>
