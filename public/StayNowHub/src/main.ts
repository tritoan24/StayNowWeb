/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import '@/assets/scss/style.scss';
import '@/assets/css/style.css';
import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import "@fontsource/montserrat";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/400-italic.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
// import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { createI18n } from 'vue-i18n';
import messages from './utils/locales/messages';
// @ts-ignore
import FlagIcon from 'vue-flag-icon';

const app = createApp(App);


// Cấu hình i18n
const i18n = createI18n({
  locale: 'vn',
  messages: messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true
});

// Sử dụng các plugin khác
app
  .use(IonicVue)
  .use(router)
  .use(vuetify)
  .use(i18n)
  .use(FlagIcon)
  .use(createPinia());

// Mount ứng dụng
app.mount('#app');
