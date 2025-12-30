import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Edit, Search } from 'lucide-react-native'
import NewConversation from '@/components/messageScreen/newConversation'

const test_data = [{
  userName: "test",
  last_text: "Hello how are you doinggggggggggggggggggggggggggg",
  last_text_time: "1d"
}]

const Messages = () => {

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conversations, setConversations] = useState([]);
  const [refresh, setRefresh] = useState<number>(0);
  const [toggleAddConvo, setToggleAddConvo] = useState<boolean>(false);

  const closeAddConvoModal = (): void => {
    setToggleAddConvo(false);
  }

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

          <TouchableOpacity
            onPress={() => setToggleAddConvo(true)}
          >
            <Edit color={'white'} size={24} />
          </TouchableOpacity>
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

        <FlatList
          data={test_data}
          renderItem={({ item }) => {

            const content = item.last_text.length > 30 ? item.last_text.substring(0, 35) : item.last_text

            return (
              <View className='flex flex-row items-center gap-2'>
                <View className='h-12 w-12 rounded-full bg-red-600' />

                <View className='items-start'>
                  <Text className='text-white'>{item.userName}</Text>
                  <View className='flex flex-row items-center gap-2'>
                    <Text className='text-white' numberOfLines={1}>{content}</Text>
                    <Text className='text-white'>{item.last_text_time}</Text>
                  </View>
                </View>
              </View>
            )

          }}
        />

        {
          toggleAddConvo && (
            <NewConversation
              visible={toggleAddConvo}
              onClose={closeAddConvoModal}
            />
          )
        }

      </View>

    </SafeAreaView>
  )
}

export default Messages