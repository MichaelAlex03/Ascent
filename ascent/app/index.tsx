import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowRight, Mountain } from 'lucide-react-native'
import { router } from 'expo-router'

const index = () => {
    return (
        <SafeAreaView className='flex-1 p-6 bg-card'>

            <View className='flex-1 justify-center'>
                <View className='items-center gap-2 mb-14'>
                    <View className='bg-[#272a35] rounded-xl'>
                        <Mountain color={'#ff7a3d'} size={40} />
                    </View>
                    <Text className='text-2xl uppercase text-white'>Ascent</Text>
                </View>

                <View className='items-center gap-4 mb-12'>

                    <View className='items-center gap-4 mb-4'>
                        <Text className='text-5xl font-extrabold text-white'>Climb.</Text>
                        <Text className='text-5xl font-extrabold text-white'>Connect.</Text>
                        <Text className='text-5xl font-extrabold text-white'>Conquer.</Text>
                    </View>

                    <View className='items-center'>
                        <Text className='text-lg text-[#94a3b8] font-medium max-w-xs mx-auto leading-relaxed text-center'> The community for those who live life on the wall. Track ascents,
                            find partners, and share your beta.</Text>
                    </View>
                </View>

                <View className='flex items-center justify-center gap-6'>
                    <TouchableOpacity
                        className='flex-row w-full items-center justify-center gap-4 rounded-xl h-14 bg-[#ff7a3d]'
                        onPress={() => router.push('/(auth)/sign-up')}
                    >
                        <Text className='text-white font-semibold text-lg text-center'>Start Your Ascent</Text>
                        <ArrowRight color={'white'} />
                    </TouchableOpacity>


                    <TouchableOpacity
                        className='flex bg-[#1f2331] rounded-xl border border-[#3a3d4a] w-full items-center justify-center h-14'
                        onPress={() => router.push('/(auth)/sign-in')}
                    >
                        <Text className='text-white font-semibold text-lg text-center'>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default index