import { ResetPasswordForm } from '@/components/reset-password-form';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function ResetPasswordScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-1 mt-safe"
      keyboardDismissMode="interactive">
      <View className="flex-1 w-full bg-card">
        <ResetPasswordForm />
      </View>
    </ScrollView>
  );
}
