import { VerifyEmailForm } from '@/components/verify-email-form';
import { ScrollView, View } from 'react-native';

export default function VerifyEmailScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="flex-1 mt-safe ios:mt-0"
      keyboardDismissMode="interactive">
      <View className="flex-1 w-full bg-card">
        <VerifyEmailForm />
      </View>
    </ScrollView>
  );
}
