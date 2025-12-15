import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as React from 'react';
import { TextInput, View } from 'react-native';

export function ResetPasswordForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const codeInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState({ code: '', password: '' });

  async function onSubmit() {
    if (!isLoaded) {
      return;
    }
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        // Set the active session to
        // the newly created session (user is now signed in)
        setActive({ session: result.createdSessionId });
        return;
      }
      // TODO: Handle other statuses
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isPasswordMessage = err.message.toLowerCase().includes('password');
        setError({ code: '', password: isPasswordMessage ? err.message : '' });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onPasswordSubmitEditing() {
    codeInputRef.current?.focus();
  }

  return (
    <View className="flex-1 p-6">
      <View className="flex-1 justify-center pb-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Reset password</Text>
          <Text className="text-lg text-muted-foreground">
            Enter the code sent to your email and set a new password
          </Text>
        </View>

        <View className="gap-5">
          <View className="gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
              New password
            </Label>
            <Input
              id="password"
              secureTextEntry
              onChangeText={setPassword}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={onPasswordSubmitEditing}
              placeholder="Min. 8 characters"
              className="h-12"
            />
            {error.password ? (
              <Text className="text-sm text-destructive mt-1">{error.password}</Text>
            ) : null}
          </View>

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
            {error.code ? (
              <Text className="text-sm text-destructive mt-1">{error.code}</Text>
            ) : null}
          </View>

          <Button className="w-full h-14 mt-2" onPress={onSubmit}>
            <Text className="font-bold text-lg">Reset Password</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
