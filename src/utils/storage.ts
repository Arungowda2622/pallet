// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'APP_CART';

export const loadCart = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CART_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading cart:', e);
    return [];
  }
};

export const saveCart = async (cart: any[]) => {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
};

export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (e) {
    console.error('Error clearing cart:', e);
  }
};
