import React, { useRef, useState, useCallback, memo } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Platform,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  type ColorValue,
} from 'react-native';

interface OTPInputProps {
  length?: number;
  onChangeOTP?: (otp: string) => void;
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  cursorColor?: ColorValue;
}

const OTPDigitInput = memo(
  ({
    value,
    onChangeText,
    onKeyPress,
    onFocus,
    inputRef,
    inputStyle,
    secure,
    keyboardType,
    cursorColor,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    onKeyPress: (e: any) => void;
    onFocus: () => void;
    inputRef: (ref: TextInput | null) => void;
    inputStyle?: StyleProp<TextStyle>;
    secure?: boolean;
    keyboardType: import('react-native').KeyboardTypeOptions;
    cursorColor?: ColorValue;
  }) => (
    <TextInput
      testID="otp-input"
      style={[styles.input, inputStyle]}
      keyboardType={keyboardType}
      maxLength={1}
      value={value}
      onChangeText={onChangeText}
      onKeyPress={onKeyPress}
      onFocus={onFocus}
      ref={inputRef}
      secureTextEntry={secure}
      autoCorrect={false}
      autoCapitalize="none"
      importantForAutofill="no"
      textContentType="oneTimeCode"
      cursorColor={cursorColor}
    />
  )
);

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onChangeOTP,
  secure = false,
  containerStyle,
  inputStyle,
  cursorColor,
}) => {
  // Use a single string for OTP state
  const [otp, setOTP] = useState('');
  const inputs = useRef<Array<TextInput | null>>([]);

  // Handler for text change
  const handleChange = useCallback(
    (text: string, index: number) => {
      if (!/^\d?$/.test(text)) return; // Only allow single digit

      let newOTP = otp.split('');
      // Prevent typing if previous fields are not filled
      if (index > 0 && newOTP[index - 1] === undefined) return;

      if (text === '') {
        newOTP[index] = '';
      } else {
        newOTP[index] = text;
      }
      // Fill empty slots with ''
      newOTP = Array.from({ length }, (_, i) => newOTP[i] || '');
      const joined = newOTP.join('');
      setOTP(joined);
      onChangeOTP?.(joined);

      // Auto focus next
      if (text && index < length - 1) {
        if (Platform.OS === 'web') {
          setTimeout(() => {
            inputs.current[index + 1]?.focus();
          }, 10);
        } else {
          inputs.current[index + 1]?.focus();
        }
      }
    },
    [otp, length, onChangeOTP]
  );

  // Handler for key press (backspace)
  const handleKeyPress = useCallback(
    (e: any, index: number) => {
      if (e.nativeEvent.key === 'Backspace') {
        if (otp[index]) {
          // Clear current field
          const newOTP = otp
            .split('')
            .map((c, i) => (i === index ? '' : c))
            .join('');
          setOTP(newOTP);
          onChangeOTP?.(newOTP);
        } else if (index > 0) {
          // Move focus to previous and clear that
          inputs.current[index - 1]?.focus();
          const newOTP = otp
            .split('')
            .map((c, i) => (i === index - 1 ? '' : c))
            .join('');
          setOTP(newOTP);
          onChangeOTP?.(newOTP);
        }
      }
    },
    [otp, onChangeOTP]
  );

  // Handler for focus
  const handleFocus = useCallback(
    (index: number) => {
      const otpArr = otp.split('');
      // Find the first empty index, or the last index if all are filled
      const firstEmptyIndex = otpArr.findIndex((char) => char === '');
      const targetIndex =
        firstEmptyIndex === -1 ? otpArr.length : firstEmptyIndex;

      // If user clicks after the first empty, move focus to first empty
      if (index > targetIndex) {
        inputs.current[targetIndex]?.focus();
        setTimeout(() => {
          inputs.current[index]?.blur();
        }, 0);
      } else if (index < targetIndex) {
        // If user clicks before the first empty, allow normal focus
        // Do nothing
      } else if (index === targetIndex) {
        // If user clicks exactly on the first empty, allow normal focus
        // Do nothing
      }
    },
    [otp]
  );

  // Render
  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length }).map((_, i) => (
        <OTPDigitInput
          key={i}
          value={otp[i] || ''}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          onFocus={() => handleFocus(i)}
          inputRef={(ref) => {
            inputs.current[i] = ref;
          }}
          inputStyle={inputStyle}
          secure={secure}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          cursorColor={cursorColor}
        />
      ))}
    </View>
  );
};

OTPInput.displayName = 'OTPInput';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  input: {
    borderBottomWidth: 2,
    borderColor: '#ccc',
    width: 40,
    height: 50,
    textAlign: 'center',
    fontSize: 20,
  },
});
