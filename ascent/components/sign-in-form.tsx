import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { type TextInput, View } from 'react-native';

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string }>({});

  async function onSubmit() {
    if (!isLoaded) {
      return;
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        setError({ email: '', password: '' });
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }
      // TODO: Handle other statuses
      console.error(JSON.stringify(signInAttempt, null, 2));
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
    <View className="flex-1 px-6">
      <View className="flex-1 justify-center pb-12">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Welcome back</Text>
          <Text className="text-lg text-muted-foreground">
            Enter your details to access your account.
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
            <View className="flex-row justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                Password
              </Label>
              <Link asChild href={`/(auth)/forgot-password?email=${email}`}>
                <Button variant="link" size="sm" className="h-auto px-0 py-0">
                  <Text className="text-xs text-primary font-medium">Forgot password?</Text>
                </Button>
              </Link>
            </View>
            <Input
              ref={passwordInputRef}
              id="password"
              secureTextEntry
              onChangeText={setPassword}
              returnKeyType="send"
              onSubmitEditing={onSubmit}
              placeholder="••••••••"
              className="h-12"
            />
            {error.password ? (
              <Text className="text-sm text-destructive mt-1">{error.password}</Text>
            ) : null}
          </View>

          <Button className="w-full h-14 mt-2" onPress={onSubmit}>
            <Text className="font-bold text-lg">Log In</Text>
          </Button>
        </View>

        <View className="mt-8">
          <Text className="text-center text-muted-foreground mb-4">
            Don&apos;t have an account?{' '}
            <Link href="/(auth)/sign-up" className="text-primary font-semibold">
              Sign up
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
