import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { WelcomeScreen } from './src/screens/auth';

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#2A7D76" />
      <WelcomeScreen />
    </>
  );
}