import { View, Text, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Edit, Search } from 'lucide-react-native'

const Messages = () => {

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conversations, setConversations] = useState([]);
  const [refresh, setRefresh] = useState<number>(0);

  const fetchConversations = async () => {
    try {
      
    } catch (error) {
      
    }
  }

  useEffect(() => {
    fetchConversations();
  }, [])

  return (
    <SafeAreaView className='flex-1 bg-[#1a1d26]'>
      <View className='flex-1 p-4'>
        <View className='flex flex-row justify-between items-center'>
          <Text className='text-white text-3xl font-bold'>Messages</Text>
          <Edit color={'white'} size={24} />
        </View>


        <View className="flex-row items-center bg-[#272a35] border border-[#3a3d4a] rounded-xl px-4 py-3 mb-4 mt-4">
          <Search size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-white text-base"
            placeholder="Search by username or name..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Messages