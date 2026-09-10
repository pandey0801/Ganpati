import React from 'react';
import { StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';

export default function ContactButtons() {
  return (
    <View style={styles.container}>
      <AppButton title="Call" style={styles.button} />
      <AppButton title="Message" variant="secondary" style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
  },
});
