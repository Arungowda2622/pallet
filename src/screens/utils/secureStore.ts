import * as Keychain from 'react-native-keychain';

/**
 * Save token securely
 */
export const saveToken = async (token: string) => {
  try {
    await Keychain.setGenericPassword('auth', token, {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    console.log('Token saved securely.');
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Get token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      console.log('Token retrieved from Keychain.');
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Remove token (for logout)
 */
export const removeToken = async () => {
  try {
    await Keychain.resetGenericPassword();
    console.log('Token removed from Keychain.');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};
