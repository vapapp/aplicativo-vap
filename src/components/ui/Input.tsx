import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Sizes } from '../../utils/constants';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  rightIcon?: string;
  leftIcon?: string;
  isPassword?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onChangeText?: (text: string) => void;
  onClearError?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  rightIcon,
  leftIcon,
  isPassword = false,
  style,
  inputStyle,
  onChangeText,
  onClearError,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleChangeText = (text: string) => {
    // Limpar erro quando o usuário digitar
    if (error && onClearError) {
      onClearError();
    }
    onChangeText?.(text);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
        style
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Icon name={leftIcon} size={20} color={Colors.neutral[400]} />
          </View>
        )}
        
        <TextInput
          style={[
            styles.input, 
            leftIcon && styles.inputWithLeftIcon,
            inputStyle
          ]}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={Colors.neutral[400]}
          onChangeText={handleChangeText}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
            <Icon 
              name={isPasswordVisible ? 'visibility' : 'visibility-off'} 
              size={20} 
              color={Colors.neutral[400]} 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <View style={styles.rightIcon}>
            <Icon name={rightIcon} size={20} color={Colors.neutral[400]} />
          </View>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Sizes.spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: Sizes.radius.lg,
    backgroundColor: Colors.neutral[0],
    minHeight: Sizes.input.md,
  },
  inputFocused: {
    borderColor: Colors.vapapp.teal,
    borderWidth: 2,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: Sizes.spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: Sizes.spacing.xs,
  },
  leftIcon: {
    paddingLeft: Sizes.spacing.md,
  },
  rightIcon: {
    paddingRight: Sizes.spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: Sizes.spacing.xs,
  },
});