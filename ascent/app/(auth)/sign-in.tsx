import { SignInForm } from '@/components/sign-in-form';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function SignInScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-1 mt-safe ios:mt-0"
      keyboardDismissMode="interactive">
      <View className="flex-1 w-full bg-card">
        <SignInForm />
      </View>
    </ScrollView>
  );
}
