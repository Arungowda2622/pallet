import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const LoginScreen = ({ navigation }: any) => {
  const handleNav = () => {
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleNav}>
        <Text style={styles.text}>Login Screen (Tap to go Home)</Text>
      </Pressable>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
});
