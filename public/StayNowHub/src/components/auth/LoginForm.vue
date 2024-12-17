<script lang="ts">
import { ref } from "vue";

import { Form } from "vee-validate";


export default {
  components: {
    Form,
  },
  setup() {
    const checkbox = ref(false);
    const valid = ref(false);
    const show1 = ref(false);
    const password = ref("");
    const username = ref("");
    const passwordRules = ref([
      (v: string) => !!v || "Password is required",
      (v: string) =>
        (v && v.length <= 10) || "Password must be less than 10 characters",
    ]);
    const emailRules = ref([
      (v: string) => !!v || "E-mail is required",
      (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ]);

    return {
      checkbox,
      valid,
      show1,
      password,
      username,
      passwordRules,
      emailRules,
    };
  },
};
</script>

<template>
  <div>
    <div class="d-flex align-center text-center mb-6">
    </div>
    <Form v-slot="{ isSubmitting }" class="mt-5">
      <v-label
        class="text-subtitle-1 font-weight-semibold pb-2 text-lightText"
        >{{ $t("Email") }}</v-label
      >
      <VTextField
        v-model="username"
        :rules="emailRules"
        class="mb-8"
        required
        variant="outlined"
        single-line
        hide-details="auto"
      ></VTextField>
      <v-label
        class="text-subtitle-1 font-weight-semibold pb-2 text-lightText"
        >{{ $t("Password") }}</v-label
      >
      <VTextField
        v-model="password"
        :rules="passwordRules"
        required
        variant="outlined"
        single-line
        hide-details="auto"
        type="password"
        class="pwdInput"
      ></VTextField>
      <div class="d-flex flex-wrap align-center my-3 ml-n2">
        <v-checkbox v-model="checkbox" required hide-details color="primary">
          <template v-slot:label>{{ $t("Remember Me") }}</template>
        </v-checkbox>
        <div class="ml-sm-auto">
          <RouterLink
            to=""
            class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium"
            >{{ $t("Forgot Password?") }}</RouterLink
          >
        </div>
      </div>
      <v-btn
        size="large"
        :loading="isSubmitting"
        color="primary"
        :disabled="valid"
        block
        type="submit"
        flat
        >{{ $t("Sign In") }}</v-btn
      >
    </Form>
  </div>
</template>
