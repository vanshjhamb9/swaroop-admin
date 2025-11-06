import { create } from "zustand";

const useAdminOwnerStore = create<AdminStore>((set, get) => ({
  info: {
    email: "",
    name: "",
    uid: "",
  },
  setinfo(d) {
    set((state) => ({
      ...state,
      info: {
        email: d.email,
        name: d.name,
        uid: d.uid,
      },
    }));
  },
}));

export default useAdminOwnerStore;
