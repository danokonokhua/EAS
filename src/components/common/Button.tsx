import React from 'react';
import { Button as PaperButton } from 'react-native-paper';

type ButtonProps = {
  onPress: () => void;
  title: string;
  mode?: 'text' | 'outlined' | 'contained';
};

export default function Button({ onPress, title, mode = 'contained' }: ButtonProps) {
  return (
    <PaperButton mode={mode} onPress={onPress}>
      {title}
    </PaperButton>
  );
}
