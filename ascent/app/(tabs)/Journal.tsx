import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { X, Plus, Minus, Check, Calendar, Mountain } from 'lucide-react-native'
import AddClimbModal from '@/components/journalComponents/addClimbModal'
import { useAuth } from '@clerk/clerk-expo'


interface Climbs {
  type: string
  grade: string
  wallType: string
  attempts: number
  notes: string
}

const Journal = () => {

  const { getToken } = useAuth();

  const [completedBoulders, setCompletedBoulders] = useState<Climbs[]>([]);
  const [completedRoutes, setCompletedRoutes] = useState<Climbs[]>([]);
  const [showBoulders, setShowBoulder] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(false);
  const [toggleAddClimb, setToggleAddClimb] = useState<boolean>(false);

  const closeAddClimbModal = () => {
    setToggleAddClimb(false);
  }

  const handleSaveClimb = async () => {
    const token = await getToken()

    try {
      const response = await fetch("http://localhost:81/journals", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      console.log(response)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-[#1a1d26]'>
      <View className='flex-1 relative'>
        {
          <TouchableOpacity
            className='absolute rounded-full bg-primary w-14 h-14 items-center justify-center bottom-0 right-6 z-10'
            onPress={() => setToggleAddClimb(true)}
          >
            <Plus color={'white'} size={24} />
          </TouchableOpacity>
        }
        <View className='p-4 border-b border-[#3a3d4a]'>
          <Text className='text-white text-2xl font-bold'>Journal</Text>
        </View>

        <FlatList
          data={[]}
          renderItem={() => (<View></View>)}
          ListHeaderComponent={() => (
            <View className='flex flex-row mt-6 mx-auto border bg-card border-[#3a3d4a] rounded-xl gap-2 items-center justify-center'>
              <TouchableOpacity
                className={`${showBoulders ? 'bg-primary' : 'bg-card'} w-40 py-3 rounded-xl`}
                onPress={() => {
                  setShowBoulder(true)
                  setShowRoutes(false)
                }}
              >
                <Text className={`${showBoulders ? 'text-white' : 'text-muted-foreground'} text-lg font-bold text-center`}>Boulders</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`${showRoutes ? 'bg-primary' : 'bg-card'} w-40 py-3 rounded-xl`}
                onPress={() => {
                  setShowBoulder(false)
                  setShowRoutes(true)
                }}
              >
                <Text className={`${showRoutes ? 'text-white' : 'text-muted-foreground'} text-lg font-bold text-center`}>Routes</Text>
              </TouchableOpacity>
            </View>

          )}
          ListEmptyComponent={() => (
            <View className='flex items-center justify-center mt-16 gap-4'>
              <View className='rounded-full flex items-center justify-center bg-[#272a35] p-6'>
                <Mountain color={'#64748b'} size={48} />
              </View>
              <View className='flex items-center justify-center'>
                <Text className='text-white font-bold text-lg'>No climbs yet</Text>
                <Text className='text-muted-foreground text-base'>Start tracking your climbing sessions</Text>
              </View>
            </View>
          )}
        />

        {
          toggleAddClimb && (
            <AddClimbModal
              visisble={toggleAddClimb}
              onClose={closeAddClimbModal}
              onSave={handleSaveClimb}
            />
          )
        }

      </View>
    </SafeAreaView>
  )
}

export default Journal