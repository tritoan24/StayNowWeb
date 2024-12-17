// src/mixins/deviceMixin.ts
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    };
  },
  methods: {
    checkDevice() {
      const width = window.innerWidth;
      if (width <= 767) {
        this.isMobile = true;
        this.isTablet = false;
        this.isDesktop = false;
      } else if (width >= 768 && width <= 1024) {
        this.isMobile = false;
        this.isTablet = true;
        this.isDesktop = false;
      } else {
        this.isMobile = false;
        this.isTablet = false;
        this.isDesktop = true;
      }
    },
  },
  mounted() {
    this.checkDevice();
    window.addEventListener("resize", this.checkDevice);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkDevice);
  },
});
