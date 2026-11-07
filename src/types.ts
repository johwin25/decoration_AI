export type Room = {
  name: string;
  length: string;
  width: string;
  height: string;
  constraints: string;
  confirmed: boolean;
};
export type Item = {
  id: string;
  name: string;
  ownership: "owned" | "wishlist";
  width: string;
  depth: string;
  height: string;
  quantity: number;
  placement: string;
  image?: string;
  modelAssetId?: string;
  modelFileName?: string;
  price: string;
  currency: string;
  url: string;
};
export type Project = { room: Room; items: Item[]; layout?: RoomLayout };
export const emptyProject: Project = {
  room: {
    name: "",
    length: "",
    width: "",
    height: "",
    constraints: "",
    confirmed: false,
  },
  items: [],
};

export type Placement = {
  id: string;
  itemId: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
};
export type RoomLayout = {
  fingerprint: string;
  placements: Placement[];
  notes: string[];
};
