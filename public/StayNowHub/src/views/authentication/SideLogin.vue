<script lang="ts">
import LoginForm from "../../components/auth/LoginForm.vue";
import { useRouter } from "vue-router";
import { IonApp, IonRouterOutlet } from "@ionic/vue";

export default {
  components: {
    LoginForm,
    IonRouterOutlet,
    IonApp,
  },

  setup() {
    const router = useRouter();
    const goToLogout = () => {
      router.push("/auth/register");
    };

    return {
      goToLogout,
    };
  },
};
</script>

<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
    <div class="pa-3">
      <v-row class="h-100vh auth bg-background">
        <v-col
          cols="12"
          lg="6"
          xl="6"
          class="d-lg-flex align-center justify-center authentication position-relative d-sm-none"
        >
          <div>
            <img
              src="../../assets/images/backgrounds/bg-login.svg"
              class="position-relative d-none d-lg-flex"
              alt="login-background"
            />
          </div>
        </v-col>
        <v-col
          cols="12"
          lg="6"
          xl="6"
          class="d-flex align-center justify-center"
        >
          <div class="mt-xl-0 mw-100">
            <img src="../../assets/images/logos/logo-mimi-business.svg" />
            <h2 class="text-h3 font-weight-bold mb-2">
              {{ $t("Welcome to MiMi") }}
            </h2>
            <div class="text-subtitle-1 mb-6">
              {{ $t("The Future of Digital Intelligence") }}
            </div>
            <LoginForm />
            <h6 class="text-h6 d-flex align-center mt-6 font-weight-medium">
              {{ $t("Don't have an account?") }}
              <v-btn
                class="pl-0 text-primary text-body-1 opacity-1 pl-2 font-weight-medium"
                height="auto"
                @click="goToLogout"
                variant="plain"
              >
                {{ $t("Sign Up") }}
              </v-btn>
            </h6>
          </div>
        </v-col>
      </v-row>
    </div>
  </ion-app>
</template>
