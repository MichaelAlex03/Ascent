import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Plus, Mountain } from 'lucide-react-native'
import AddClimbModal from '../../components/journalScreen/addClimbModal'
import { useAuth } from '@clerk/clerk-expo'
import { Climb, CreateClimbInput } from '@/types/app'
import { climbEntryItem } from '@/components/journalScreen/climbEntryItem'
import ClimbEntryModal from '@/components/journalScreen/climbEntryModal'

const Journal = () => {

  const { getToken } = useAuth();

  const [completedBoulders, setCompletedBoulders] = useState<Climb[]>([]);
  const [completedRoutes, setCompletedRoutes] = useState<Climb[]>([]);
  const [showBoulders, setShowBoulder] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(false);
  const [toggleAddClimb, setToggleAddClimb] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);
  const [toggleViewClimb, setToggleViewClimb] = useState<boolean>(false);
  const [activeClimb, setActiveClimb] = useState<Climb>({} as Climb);
  

  const closeAddClimbModal = (): void => {
    setToggleAddClimb(false);
  }

  const closeViewClimbModal = (): void => {
    setToggleViewClimb(false)
  }

  const handleSaveClimb = async (climb: CreateClimbInput): Promise<boolean> => {
  
    const token = await getToken()

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_JOURNAL_API}/journals`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(climb)
      })

      if (response.status === 201) {
        Alert.alert("Climb Added", "Your climb was successfully added")
        setRefresh(prev => prev + 1)
        return true;
      }

      Alert.alert("Failed to Add Climb", "Please try again");
      return false
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add climb. Please check your connection.");
      return false
    }
    
  }

  const fetchClimbs = async () => {
    const token = await getToken()

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_JOURNAL_API}/journals`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      if (response.status === 200) {
        const climbs: Climb[] = await response.json();
        const boulders = climbs.filter(c => c.climb_type === "boulder")
        const routes = climbs.filter(c => c.climb_type === 'route')
        setCompletedBoulders(boulders);
        setCompletedRoutes(routes);
        return;
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Failed To Get Climbs", "Climbs were not able to be retrieved");
    }
  }

  useEffect(() => {
    fetchClimbs();
  }, [refresh])




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
          <Text className='text-white text-3xl font-bold'>Journal</Text>
        </View>

        <FlatList
          data={showBoulders ? completedBoulders : completedRoutes}
          renderItem={({item}) => climbEntryItem({ item, setToggleViewClimb, setActiveClimb})}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View className='flex flex-row mt-6 mb-6 mx-auto border bg-card border-[#3a3d4a] rounded-xl gap-2 items-center justify-center'>
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
        {
          toggleViewClimb && (
            <ClimbEntryModal
              climb={activeClimb}
              visible={toggleViewClimb}
              onClose={closeViewClimbModal}
            />
          )
        }

      </View>
    </SafeAreaView>
  )
}

export default Journal
