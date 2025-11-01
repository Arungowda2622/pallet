import React, { useEffect } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';
import { saveToken, getToken, removeToken } from './utils/secureStore';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../store/authSlice';
import type { RootState } from '../store';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation'; // 👈 Make sure you have this type

type SignInScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignIn'
>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

const SignIn: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '807623059439-ibefd7n51pq965ok4o1ou0rahnqoi1ga.apps.googleusercontent.com',
      iosClientId:
        '807623059439-frf4hp0283up541096med9m7at5tprfi.apps.googleusercontent.com',
      scopes: [],
      forceCodeForRefreshToken: false,
    });

    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            dispatch(setUser({ userInfo: currentUser, accessToken: token }));
          }
        }
      } catch (error) {
        console.error('Auto sign-in error:', error);
      }
    })();
  }, [dispatch]);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const user: User = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      await saveToken(tokens.accessToken);
      dispatch(setUser({ userInfo: user, accessToken: tokens.accessToken }));

      navigation.navigate('Products');
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Sign-in cancelled by user.');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in already in progress.');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available.');
      } else {
        console.error('Sign-in error:', err);
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await removeToken();
      dispatch(clearUser());
    } catch (error) {
      console.error('Sign-out error:', error);
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
        <View style={styles.buttonContainer}>
          <Button
            title="Go to Products"
            onPress={() => navigation.navigate('Products')}
          />
          <View style={{ marginVertical: 10 }} />
          <Button title="Sign Out" onPress={signOut} color="red" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonContainer: { alignItems: 'center', justifyContent: 'center' },
});

export default SignIn;
