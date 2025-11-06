import { db, storage } from "@/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { create } from "zustand";
import OwnersStore from "./OwnersInfo";
import { v4 as uuidv4 } from "uuid";
const useVehicleStore = create<vehicleStore>((set, get) => ({
  vehicle: {
    images: [],
    model: "",
    name: "",
    registration: "",
    editing: false,
    id: "",
  },
  resetVehicle() {
    set((state) => ({
      ...state,
      vehicle: {
        images: [],
        model: "",
        name: "",
        registration: "",
        editing: false,
        id: "",
      },
    }));
  },
  setVehicle(v, editing = false) {
    window !== undefined
      ? localStorage.setItem("vehicle", JSON.stringify(v))
      : null;
    set((state) => ({
      ...state,
      vehicle: { ...v, editing },
    }));
  },
  async addVehicleToDb(v) {
    try {
      let fs: any = [];
      const { info } = OwnersStore.getState();
      //   if (!uid) throw "No UID Exists";
      console.log("uid", info);
      const uploadPromises = v?.images?.map(async (f, index) => {
        console.log(typeof f);
        let fname;
        if (f instanceof File) {
          fname = f.name;
        } else {
          fname = uuidv4();
        }
        console.log("fname", fname);
        let name = `dealersVehicles/${info.uid}/${v.registration}/${fname}_${index}`;

        try {
          if (f.toString().startsWith("blob")) {
            const response = await fetch(f as string);
            const blob = await response.blob(); // Convert the Blob URL to Blob object
            const r = await uploadBytes(ref(storage, name), blob);
            const constructedURL = await getDownloadURL(ref(storage, name));
            fs.push(constructedURL);
          }
          console.log("f Uploaded");
        } catch (e) {
          // alert(e);
          throw e;
        }
      });
      await Promise.all(uploadPromises);
      if (v.editing) {
        await updateDoc(doc(db, "dealers", info.uid, "vehicles", v.id!), {
          name: v.name,
          model: v.model,
          registration: v.registration,
          images: fs,
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "dealers", info.uid, "vehicles"), {
          name: v.name,
          model: v.model,
          registration: v.registration,
          images: fs,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      throw e;
    }
  },
}));

export default useVehicleStore;
