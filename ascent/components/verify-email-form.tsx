import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignUp } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { type TextStyle, View } from 'react-native';

const RESEND_CODE_INTERVAL_SECONDS = 30;

const TABULAR_NUMBERS_STYLE: TextStyle = { fontVariant: ['tabular-nums'] };

export function VerifyEmailForm() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const { countdown, restartCountdown } = useCountdown(RESEND_CODE_INTERVAL_SECONDS);

  async function onSubmit() {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        return;
      }
      // TODO: Handle other statuses
      // If the status is not complete, check why. User may need to
      // complete further steps.
      console.error(JSON.stringify(signUpAttempt, null, 2));
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  async function onResendCode() {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      restartCountdown();
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  return (
    <View className="flex-1 p-6">
      <View className="flex-1 justify-center pb-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Verify your email</Text>
          <Text className="text-lg text-muted-foreground">
            Enter the verification code sent to {email || 'your email'}
          </Text>
        </View>

        <View className="gap-5">
          <View className="gap-2">
            <Label htmlFor="code" className="text-sm font-medium text-muted-foreground">
              Verification code
            </Label>
            <Input
              id="code"
              autoCapitalize="none"
              onChangeText={setCode}
              returnKeyType="send"
              keyboardType="numeric"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              onSubmitEditing={onSubmit}
              placeholder="Enter 6-digit code"
              className="h-12"
            />
            {!error ? null : (
              <Text className="text-sm text-destructive mt-1">{error}</Text>
            )}
            <Button variant="link" size="sm" disabled={countdown > 0} onPress={onResendCode} className="mt-1">
              <Text className="text-xs text-primary">
                Didn&apos;t receive the code? Resend{' '}
                {countdown > 0 ? (
                  <Text className="text-xs" style={TABULAR_NUMBERS_STYLE}>
                    ({countdown})
                  </Text>
                ) : null}
              </Text>
            </Button>
          </View>

          <View className="gap-3 mt-2">
            <Button className="w-full h-14" onPress={onSubmit}>
              <Text className="font-bold text-lg">Continue</Text>
            </Button>
            <Button variant="link" className="mx-auto" onPress={router.back}>
              <Text>Cancel</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

function useCountdown(seconds = 30) {
  const [countdown, setCountdown] = React.useState(seconds);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = React.useCallback(() => {
    setCountdown(seconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  React.useEffect(() => {
    startCountdown();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCountdown]);

  return { countdown, restartCountdown: startCountdown };
}
