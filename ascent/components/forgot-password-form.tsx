import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import * as React from 'react';
import { View } from 'react-native';

export function ForgotPasswordForm() {
  const { email: emailParam = '' } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = React.useState(emailParam);
  const { signIn, isLoaded } = useSignIn();
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});

  const onSubmit = async () => {
    if (!email) {
      setError({ email: 'Email is required' });
      return;
    }
    if (!isLoaded) {
      return;
    }

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      router.push(`/(auth)/reset-password?email=${email}`);
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError({ email: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="flex-1 p-6">
      <View className="flex-1 justify-center pb-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Forgot password?</Text>
          <Text className="text-lg text-muted-foreground">
            Enter your email to reset your password
          </Text>
        </View>

        <View className="gap-5">
          <View className="gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Email address
            </Label>
            <Input
              id="email"
              defaultValue={email}
              placeholder="climber@example.com"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              onChangeText={setEmail}
              onSubmitEditing={onSubmit}
              returnKeyType="send"
              className="h-12"
            />
            {error.email ? (
              <Text className="text-sm text-destructive mt-1">{error.email}</Text>
            ) : null}
          </View>

          <Button className="w-full h-14 mt-2" onPress={onSubmit}>
            <Text className="font-bold text-lg">Reset your password</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
