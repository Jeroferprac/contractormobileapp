import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../constants/colors';
import { BORDER_RADIUS } from '../constants/spacing';

export type InputKeyboardType = 'default' | 'email-address' | 'phone-pad' | 'numeric';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  style,
  inputStyle,
  autoCapitalize = 'none',
  autoCorrect = false,
  ...restProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.secondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          {...restProps}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <Icon 
              name={isPasswordVisible ? 'eye-off' : 'eye'} 
              size={20} 
              color={COLORS.text.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  inputError: {
    borderColor: COLORS.status.error,
  },
  iconContainer: {
    marginRight: 12,
    width: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: COLORS.status.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
}); 