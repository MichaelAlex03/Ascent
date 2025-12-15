import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { TextInput, View } from 'react-native';

export function SignUpForm() {
  const { signUp, isLoaded } = useSignUp();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});

  async function onSubmit() {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      router.push(`/(auth)/sign-up/verify-email?email=${email}`);
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="flex-1 p-6">
      <View className="flex-1 justify-center pb-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Create account</Text>
          <Text className="text-lg text-muted-foreground">
            Join the community and start tracking your climbs.
          </Text>
        </View>

        <View className="gap-5">
          <View className="gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Email address
            </Label>
            <Input
              id="email"
              placeholder="climber@example.com"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              onChangeText={setEmail}
              onSubmitEditing={onEmailSubmitEditing}
              returnKeyType="next"
              submitBehavior="submit"
              className="h-12"
            />
            {error.email ? (
              <Text className="text-sm text-destructive mt-1">{error.email}</Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
              Password
            </Label>
            <Input
              ref={passwordInputRef}
              id="password"
              secureTextEntry
              onChangeText={setPassword}
              returnKeyType="send"
              onSubmitEditing={onSubmit}
              placeholder="Min. 8 characters"
              className="h-12"
            />
            {error.password ? (
              <Text className="text-sm text-destructive mt-1">{error.password}</Text>
            ) : null}
          </View>

          <Button className="w-full h-14 mt-2" onPress={onSubmit}>
            <Text className="font-bold text-lg">Create Account</Text>
          </Button>
        </View>

        <View className="mt-8">
          <Text className="text-center text-muted-foreground mb-4">
            Already have an account?{' '}
            <Link href="/(auth)/sign-in" dismissTo className="text-primary font-semibold">
              Log in
            </Link>
          </Text>

          <View className="flex-row items-center my-6">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">or continue with</Text>
            <Separator className="flex-1" />
          </View>

          <SocialConnections />
        </View>
      </View>
    </View>
  );
}
