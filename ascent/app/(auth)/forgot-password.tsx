import { ForgotPasswordForm } from '@/components/forgot-password-form';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function ForgotPasswordScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-1 mt-safe"
      keyboardDismissMode="interactive">
      <View className="flex-1 w-full bg-card">
        <ForgotPasswordForm />
      </View>
    </ScrollView>
  );
}
