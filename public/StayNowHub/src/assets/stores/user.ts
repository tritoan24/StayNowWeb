import { defineStore } from "pinia";


interface NocoDbData {
  baseID: string;
  userID: string;
}

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    fullname: localStorage.getItem("userFullname"),
    email: localStorage.getItem("userEmail"),
    imageURL: localStorage.getItem("userImageURL"),
    noco_db:{
      baseID: '',
      userID: '',
    }
  }),

  actions: {
   

    setNocoDb(data: NocoDbData){
      this.noco_db.baseID = data.baseID;
      this.noco_db.userID = data.userID;
    },

    // Action để tải ảnh từ URL
    async loadImage(imageUrl: string) {
      try {
        if (!imageUrl.startsWith("blob:")) {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error("Failed to load image");

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          this.imageURL = objectUrl;
          localStorage.setItem("userImageURL", this.imageURL);
        }

        // Giải phóng URL khi không còn sử dụng
        // URL.revokeObjectURL(objectUrl); // Bạn có thể gọi hàm này khi không còn cần URL nữa
      } catch (error) {
        console.error("Error loading image:", error);
      }
    },
  },
});
