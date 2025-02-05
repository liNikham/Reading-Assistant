// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import imageReducer from "./imageSlice";

// You can create slices for different parts of your state, for now, we can have an empty one.
const store = configureStore({
  reducer: {
    image: imageReducer,
  },
});

export default store;
