import { View, StyleSheet } from 'react-native';
import OTPInput from '@jkrmarmol/react-native-otp-input';

export default function App() {
  return (
    <View style={styles.container}>
      <OTPInput length={6} onChangeOTP={(otp) => console.log(otp)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
