import React, { useEffect } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { saveToken, getToken, removeToken } from './utils/secureStore';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../store/authSlice';
import type { RootState } from '../store';
import ProductsScreen from './ProductsScreen';

const SignIn = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '807623059439-ibefd7n51pq965ok4o1ou0rahnqoi1ga.apps.googleusercontent.com',
      iosClientId: '807623059439-frf4hp0283up541096med9m7at5tprfi.apps.googleusercontent.com',
      scopes: [],
      forceCodeForRefreshToken: false,
    });

    (async () => {
      const token = await getToken();
      if (token) {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          dispatch(setUser({ userInfo: currentUser, accessToken: token }));
        }
      }
    })();
  }, [dispatch]);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const u = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      await saveToken(tokens.accessToken);
      dispatch(setUser({ userInfo: u, accessToken: tokens.accessToken }));
      navigation.navigate('Products');
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('cancelled');
      } else {
        console.error(err);
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await removeToken();
      dispatch(clearUser());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
        />
      ) : (
        <Button title="Go to Products" onPress={() => navigation.navigate('Products')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default SignIn;
