// import { create } from "zustand";

// export const useStore = create((set, get) => ({
//   batches: ["CSE-1"],
//   slots: [],

//   addBatch: (batchName) => {
//     set({ batches: [...get().batches, batchName] });
//   },

//   addSlot: (slot) => {
//     set({ slots: [...get().slots, slot] });
//   },

//   updateSlot: (slot) => {
//     set({
//       slots: get().slots.map((s) => (s.id === slot.id ? slot : s)),
//     });
//   },

//   deleteSlot: (id) => {
//     set({ slots: get().slots.filter((s) => s.id !== id) });
//   },

//   checkConflict: (newSlot) => {
//     const slots = get().slots;

//     return {
//       facultyConflict: slots.some(
//         (s) =>
//           s.faculty === newSlot.faculty &&
//           s.day === newSlot.day &&
//           s.time === newSlot.time &&
//           s.id !== newSlot.id
//       ),
//       roomConflict: slots.some(
//         (s) =>
//           s.room === newSlot.room &&
//           s.day === newSlot.day &&
//           s.time === newSlot.time &&
//           s.id !== newSlot.id
//       ),
//     };
//   },
// }));
