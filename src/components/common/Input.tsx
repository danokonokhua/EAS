import React from 'react';
import { TextInput } from 'react-native-paper';

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
};

export default function Input({ value, onChangeText, label, secureTextEntry }: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      label={label}
      secureTextEntry={secureTextEntry}
    />
  );
}
