import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Menu } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';

type showType = 'posts' | 'likes' | 'replies' | 'saved'


const Profile = () => {

  const { getToken } = useAuth()

  const [toggleSetting, setToggleSettings] = useState<boolean>(false);
  const [showType, setShowType] = useState<showType>('posts');

  const fetchUser = async () => {

  }

  const fetchFollowers = async () => {

  }

  useEffect(() => {
    fetchUser();
    fetchFollowers();
  }, [])

  return (
    <SafeAreaView className='flex-1 bg-[#1a1d26]'>
      <View className='flex-1'>
        <View className='items-end p-4'>
          <TouchableOpacity>
            <Menu color={'white'} size={24} />
          </TouchableOpacity>
        </View>

        <View className='flex flex-row justify-between items-center mt-4 px-4'>
          <View className='items-start gap-[2px]'>
            <Text className='text-white font-bold text-xl'>Michael</Text>
            <Text className='text-white text-sm'>michael.llev</Text>
            <Text className='text-white text-sm'>TXSTATE 2025</Text>
          </View>
          <View className='w-16 h-16 rounded-full bg-black border-gray-600 border' />
        </View>

        <View className='px-4'>
          <View className='mt-6 flex flex-row items-center'>
            <View className='w-4 h-4 rounded-full bg-black border-gray-600 border z-30' />
            <View className='w-4 h-4 rounded-full bg-red-500 border-gray-600 border -ml-2 z-20' />
            <View className='w-4 h-4 rounded-full bg-white border-gray-600 border -ml-2 z-10' />
            <Text className='text-gray-500 ml-2 text-md'>15 followers</Text>
          </View>

          <View className='mt-4 w-full items-center'>
            <TouchableOpacity className='border border-gray-600 rounded-xl px-4 py-2 w-full'>
              <Text className='text-white font-bold text-lg text-center'>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>


        <View className='border-b border-gray-600 mt-6 flex flex-row px-4 justify-between'>

          <TouchableOpacity
            className={`${showType === 'posts' ? 'border-b-2 border-white' : null}`}
            onPress={() => setShowType('posts')}
          >
            <Text className={`${showType === 'posts' ? 'text-white' : 'text-gray-500'} text-base px-2 py-1 font-bold`}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`${showType === 'likes' ? 'border-b-2 border-white' : null}`}
            onPress={() => setShowType('likes')}
          >
            <Text className={`${showType === 'likes' ? 'text-white' : 'text-gray-500'} text-base px-2 py-1 font-bold`}>Likes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`${showType === 'replies' ? 'border-b-2 border-white' : null}`}
            onPress={() => setShowType('replies')}
          >
            <Text className={`${showType === 'replies' ? 'text-white' : 'text-gray-500'} text-base px-2 py-1 font-bold`}>Replies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`${showType === 'saved' ? 'border-b-2 border-white' : null}`}
            onPress={() => setShowType('saved')}
          >
            <Text className={`${showType === 'saved' ? 'text-white' : 'text-gray-500'} text-base px-2 py-1 font-bold`}>Saved</Text>
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  )
}

export default Profile

