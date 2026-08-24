import { PickedImage } from "@/core/media/imagePicker";
import { create } from "zustand";

type ImportStore = {
    images: PickedImage[];
    setImages(images: PickedImage[]): void;
    clear(): void;
};

export const useImportStore = create<ImportStore>((set) => ({
    images: [],
    setImages: (images) => set({images}),
    clear: () => set({ images: [] }),
}));