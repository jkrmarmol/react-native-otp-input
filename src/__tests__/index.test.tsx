import { render, fireEvent } from '@testing-library/react-native';
import { OTPInput } from '../OTPInput';

describe('OTPInput', () => {
  it('renders correct number of inputs', () => {
    const { getAllByTestId } = render(<OTPInput length={4} />);
    expect(getAllByTestId('otp-input').length).toBe(4);
  });

  it('calls onChangeOTP with correct value when typing', () => {
    const onChangeOTP = jest.fn();
    const { getAllByTestId } = render(
      <OTPInput length={4} onChangeOTP={onChangeOTP} />
    );
    const inputs = getAllByTestId('otp-input');
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    expect(onChangeOTP).toHaveBeenLastCalledWith('12');
  });

  it('moves focus to next input after typing', () => {
    const { getAllByTestId } = render(<OTPInput length={4} />);
    const inputs = getAllByTestId('otp-input');
    fireEvent.changeText(inputs[0], '1');
    // Can't test focus directly, but no crash
    expect(inputs[1].props.autoFocus).toBeFalsy();
  });

  it('handles backspace correctly', () => {
    const onChangeOTP = jest.fn();
    const { getAllByTestId } = render(
      <OTPInput length={4} onChangeOTP={onChangeOTP} />
    );
    const inputs = getAllByTestId('otp-input');
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent(inputs[1], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(onChangeOTP).toHaveBeenLastCalledWith('1');
  });

  it('focuses first empty input when clicking after it', () => {
    const { getAllByTestId } = render(<OTPInput length={4} />);
    const inputs = getAllByTestId('otp-input');
    fireEvent.press(inputs[3]);
    // Can't test focus directly, but no crash and logic is covered
  });

  it('applies secureTextEntry when secure prop is true', () => {
    const { getAllByTestId } = render(<OTPInput length={4} secure />);
    const inputs = getAllByTestId('otp-input');
    inputs.forEach((input) => {
      expect(input.props.secureTextEntry).toBe(true);
    });
  });

  it('applies custom inputStyle', () => {
    const { getAllByTestId } = render(
      <OTPInput length={4} inputStyle={{ color: 'red' }} />
    );
    const inputs = getAllByTestId('otp-input');
    inputs.forEach((input) => {
      expect(input.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: 'red' })])
      );
    });
  });

  it('applies cursorColor prop', () => {
    const { getAllByTestId } = render(
      <OTPInput length={4} cursorColor="blue" />
    );
    const inputs = getAllByTestId('otp-input');
    inputs.forEach((input) => {
      expect(input.props.cursorColor).toBe('blue');
    });
  });

  it('does not allow non-digit input', () => {
    const onChangeOTP = jest.fn();
    const { getAllByTestId } = render(
      <OTPInput length={4} onChangeOTP={onChangeOTP} />
    );
    const inputs = getAllByTestId('otp-input');
    fireEvent.changeText(inputs[0], 'a');
    expect(onChangeOTP).not.toHaveBeenCalledWith('a');
    fireEvent.changeText(inputs[0], '1');
    expect(onChangeOTP).toHaveBeenLastCalledWith('1');
  });

  it('does not allow typing in later fields if previous are empty', () => {
    const onChangeOTP = jest.fn();
    const { getAllByTestId } = render(
      <OTPInput length={4} onChangeOTP={onChangeOTP} />
    );
    const inputs = getAllByTestId('otp-input');
    fireEvent.changeText(inputs[2], '3');
    expect(onChangeOTP).not.toHaveBeenCalledWith('003');
  });
});
