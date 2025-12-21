import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { type TextStyle, View } from 'react-native';

const RESEND_CODE_INTERVAL_SECONDS = 30;

const TABULAR_NUMBERS_STYLE: TextStyle = { fontVariant: ['tabular-nums'] }

export function verifySecondFactorScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = React.useState('');
  const [error, SetError] = React.useState('');

  async function onSubmit() {
    if (!isLoaded) return;

    try {

      const verifySecondFactor = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: code
      })

      if (verifySecondFactor.status === 'complete') {
        await setActive({ session: verifySecondFactor.createdSessionId })
        router.push('/(tabs)/Posts')
      }

    } catch (error) {
      if (error instanceof Error) {
        SetError(error.message)
        return;
      }
      console.error(JSON.stringify(error, null, 2))
    }
  }

  async function onResendCode() {
    if (!isLoaded) return;

    try {
      await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: code
      })
    } catch (error) {
      if (error instanceof Error) {
        SetError(error.message)
        return;
      }
      console.log(JSON.stringify(error, null, 2))
    }
  }

  return (
    <View className='flex-1 p-6'>
      <Text className='text-3xl font-bold'>Two-Factor Authentication</Text>
      <Text className='text-lg text-muted-foreground'>Enter the verification code sent to ${email}</Text>
    </View>
  )

}