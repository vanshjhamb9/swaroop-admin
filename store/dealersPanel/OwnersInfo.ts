import { create } from "zustand";

const useOwnersStore = create<DealersOwnersStore>((set, get) => ({
  info: {
    email: "",
    name: "",
    uid: "",
    contactDetails: "",
    vehicles: [],
  },
  setinfo(d) {
    console.log("D", d);
    set((state) => ({
      ...state,
      info: {
        email: d.email,
        name: d.name,
        uid: d.uid,
        contactDetails: d.contactDetails,
        vehicles: d.vehicles,
      },
    }));
  },
}));

export default useOwnersStore;
