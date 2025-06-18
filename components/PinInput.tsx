import { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

interface PinInputProps {
  value: string;
  onChangeText: (text: string) => void;
  length: number;
  secureTextEntry?: boolean;
  editable?: boolean;
}

export function PinInput({
  value,
  onChangeText,
  length,
  secureTextEntry = false,
  editable = true,
}: PinInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (value.length < length && editable) {
      const nextIndex = value.length;
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
  }, [value, length, editable]);

  const handleTextChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedText = text.slice(0, length);
      onChangeText(pastedText);
      const nextIndex = Math.min(pastedText.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    } else {
      // Handle single character input
      const newValue = value.split('');
      newValue[index] = text;
      const finalValue = newValue.join('').slice(0, length);
      onChangeText(finalValue);

      if (text && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
      const newValue = value.split('');
      newValue[index] = '';
      onChangeText(newValue.join(''));
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handlePress = (index: number) => {
    inputRefs.current[index]?.focus();
    setFocusedIndex(index);
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }, (_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.inputContainer,
            focusedIndex === index && styles.inputContainerFocused,
            value[index] && styles.inputContainerFilled,
          ]}
          onPress={() => handlePress(index)}
          disabled={!editable}
        >
          <TextInput
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.input}
            value={value[index] || ''}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="numeric"
            maxLength={1}
            secureTextEntry={secureTextEntry}
            editable={editable}
            selectTextOnFocus
          />
          {secureTextEntry && value[index] && (
            <View style={styles.dot} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  inputContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(149, 165, 166, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  inputContainerFocused: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  inputContainerFilled: {
    borderColor: '#27ae60',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  input: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2c3e50',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2c3e50',
  },
});