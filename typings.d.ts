type ThemeStore = {
  theme: string;
  setTheme: (name: string) => void;
};
type DealersOwnersStore = {
  info: dealersInfo;
  setinfo: (d: dealersInfo) => void;
};
type AdminStore = {
  info: AdminInfo;
  setinfo: (d: AdminInfo) => void;
};
type AdminInfo = {
  name: string;
  email: string;
  uid: string;
};
type dealersInfo = {
  name: string;
  contactDetails: string;
  vehicles: Array<VehicleItem>;
  email: string;
  uid: string;
};
type vehicleStore = {
  vehicle: VehicleItem;
  setVehicle: (v: VehicleItem, isEditing?: boolean) => void;
  resetVehicle: () => void;
  addVehicleToDb: (v: VehicleItem) => Promise<void>;
};

type VehicleItem = {
  name: string;
  model: string;
  registration: string;
  images: Array<string | File | Blob>;
  editing?: boolean;
  id?: string;
};

type dentDescription = {
  id: number;
  x: number;
  y: number;
  reference: { image: string | null; description: string };
};
type vehicle = {
  id: string;
  name: string;
  registration: string;
  model: string;
};
