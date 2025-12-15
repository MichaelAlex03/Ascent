import { SignUpForm } from '@/components/sign-up-form';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function SignUpScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-1 mt-safe ios:mt-0"
      keyboardDismissMode="interactive">
      <View className="flex-1 w-full bg-card">
        <SignUpForm />
      </View>
    </ScrollView>
  );
}
