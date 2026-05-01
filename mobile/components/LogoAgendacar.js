import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const logo = require('../assets/logo.png');

const LogoAgendacar = ({ width = 200, height = 200 }) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: '100%',
    width: '100%',
  },
});

export default LogoAgendacar;
