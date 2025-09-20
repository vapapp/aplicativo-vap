// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './src/screens/auth';

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#2A7D76" />
      <LoginScreen />
    </>
  );
}