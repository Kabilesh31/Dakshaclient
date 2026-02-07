import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedProducts: [],
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const existingProductIndex = state.selectedProducts.findIndex(
        (item) => item.productCode === action.payload.productCode,
      );
      if (existingProductIndex >= 0) {
        state.selectedProducts[existingProductIndex].quantity += 1;
      } else {
        state.selectedProducts.push({ ...action.payload, quantity: 1 });
      }
    },

    increaseQuantity: (state, action) => {
      const product = state.selectedProducts[action.payload];
      if (product) {
        product.quantity += 1;
      }
    },

    decreaseQuantity: (state, action) => {
      const product = state.selectedProducts[action.payload];
      if (product && product.quantity > 1) {
        product.quantity -= 1;
      }
    },

    updateQuantity: (state, action) => {
      const { index, quantity } = action.payload;
      const product = state.selectedProducts[index];
      if (product) {
        product.quantity = quantity;
      }
    },

    deleteProduct: (state, action) => {
      state.selectedProducts = state.selectedProducts.filter((_, index) => index !== action.payload);
    },

    clearProducts: (state) => {
      state.selectedProducts = [];
    },

    clearAllProducts: (state) => {
      state.selectedProducts = [];
    },

    updateProductValue: (state, action) => {
      const { id, newValue } = action.payload;
      const product = state.selectedProducts.find((product) => product._id === id);
      if (product) {
        product.value = newValue;
      }
    },

    updateGst: (state, action) => {
      const { index, gst } = action.payload;
      const product = state.selectedProducts[index];
      if (product) {
        product.gst = gst;
      }
    },
  },
});

export const {
  addProduct,
  increaseQuantity,
  decreaseQuantity,
  deleteProduct,
  clearProducts,
  clearAllProducts,
  updateQuantity,
  updateProductValue,
  updateGst,
} = billingSlice.actions;

export default billingSlice.reducer;
