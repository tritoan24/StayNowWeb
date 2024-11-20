import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import router from "@/router";
import Cookies from "js-cookie";

interface JwtPayload {
  azp: string;
  email: string;
  exp: number;
  fullName: string;
  iat: number;
  iss: string;
  jti: string;
  nbf: string;
  role: string;
  sub: string;
  userHubID: string;
  username: string | null;
}

interface JwtPayloadNormal {
  email: string;
  exp: number;
  iat: number;
  iss: string;
  nbf: string;
  sid: string;
  sub: string;
}

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    jwt: localStorage.getItem("jwt"),
    sid: localStorage.getItem("sid"),
    user_id: "",
    userHubID: "",
    isLoggedIn: false,
    returnUrl: "",
  }),

  actions: {
    async checkCookie() {
      return new Promise<string | undefined>((resolve) => {
        const interval = setInterval(() => {
          const sessionValue = Cookies.get("__session");
          if (sessionValue) {
            clearInterval(interval);
            resolve(sessionValue);
          }
        }, 100); // Kiểm tra cookie sau mỗi 100ms

        // Dừng kiểm tra sau 5 giây
        setTimeout(() => {
          clearInterval(interval);
          resolve(undefined);
        }, 2000);
      });
    },

    async getJWTAndNavigate(tokenNormal: any) {
      const decodedTokenNormal = jwtDecode<JwtPayloadNormal>(tokenNormal);

      const sessionId = decodedTokenNormal.sid;
      this.sid = sessionId;
      localStorage.setItem("sid", sessionId);

      router.push("/");
    },

    decodeJWT(token: string) {
      const decodedToken = jwtDecode<JwtPayload>(token);

      const user_id = decodedToken.sub;
      const userHubID = decodedToken.userHubID

      const isLoggedIn = true;

      this.setStoreData(token, user_id, userHubID, isLoggedIn);
    },

    setStoreData(
      token: string,
      user_id: string,
      userHubID: string,
      isLoggedIn: boolean
    ) {
      this.jwt = token;
      localStorage.setItem("jwt", token);
      this.user_id = user_id;
      this.userHubID = userHubID;
      localStorage.setItem("userHubID", userHubID);
      this.isLoggedIn = isLoggedIn;
    },

    /**
     * Kiểm tra token đang được lưu trong localStorage đã hết hạn chưa
     * @returns
     */
    isTokenExpired(): boolean {
      if (!this.jwt) {
        const sessionValue = Cookies.get("__session");
        if (sessionValue) {
          this.getJWTAndNavigate(sessionValue);
          return false;
        } else {
          return true;
        }
      } else {
        const decodedToken = jwtDecode<JwtPayload>(this.jwt ?? "");
        const currentTime = Math.floor(Date.now() / 1000); // thời gian hiện tại tính bằng giây

        if (decodedToken.exp < currentTime == true) {
          this.setStoreDataIsEmpty();
        }

        return decodedToken.exp < currentTime;
      }
    },

    navigateToHomePageIfHasJWT() {
      const tokenExpired = this.isTokenExpired();

      if (!tokenExpired) {
        this.decodeJWT(this.jwt ?? "");

        if (this.isLoggedIn) {
          router.push("/");
        }
      }
    },

    async checkTokenValid() {
      const tokenExpired = this.isTokenExpired();
      if (!tokenExpired) {
        this.decodeJWT(this.jwt ?? "");
      } else {
        const sessionValue = await this.checkCookie();
        if (sessionValue) {
          const decodedTokenNormal = jwtDecode<JwtPayloadNormal>(sessionValue);
          const sessionId = decodedTokenNormal.sid;
          this.sid = sessionId;
          localStorage.setItem("sid", sessionId);
        } else {
          router.push("");
        }
      }
    },

    /**
     * Đặt toàn bộ dữ liệu trống trong store
     */
    setStoreDataIsEmpty() {
      this.jwt = null;
      localStorage.removeItem("jwt");
      this.sid = null;
      localStorage.removeItem("sid");
      localStorage.removeItem("baseID");
      this.isLoggedIn = false;
    },
  },
});
