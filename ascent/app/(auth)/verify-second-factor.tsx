import { verifySecondFactorScreen } from '@/components/verify-second-factor-form';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifySecondFactorScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <VerifySecondFactorScreen />
    </SafeAreaView>
  );
}