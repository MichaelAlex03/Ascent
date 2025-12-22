import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { X, Plus, Minus } from 'lucide-react-native'

interface AddClimbProps {
    visisble: boolean
    onClose: () => void
    onSave: () => void
}

const boulderGrades = [
    'V0',
    'V1',
    'V2',
    'V3',
    'V4',
    'V5',
    'V6',
    'V7',
    'V8',
    'V9',
    'V10',
]
const routeGrades = [
    '5.8',
    '5.9',
    '5.10a',
    '5.10b',
    '5.10c',
    '5.10d',
    '5.11a',
    '5.11b',
    '5.11c',
    '5.11d',
    '5.12a',
    '5.12b',
]

type WallType = 'slab' | 'overhang' | 'vertical'

const AddClimbModal = ({ visisble, onClose, onSave }: AddClimbProps) => {

    const [addBoulders, setAddBoulder] = useState<boolean>(true);
    const [addRoutes, setAddRoutes] = useState<boolean>(false);
    const [selectedGrade, setSelectedGrade] = useState<string>('');
    const [selectedWallType, setSelectedWallType] = useState<WallType | null>(null);
    const [attempts, setAttempts] = useState<number>(1);
    const [notes, SetNotes] = useState<string>('');

    const grades = addBoulders ? boulderGrades : routeGrades;


    return (
        <Modal
            visible={visisble}
            onRequestClose={onClose}
            animationType='slide'
            transparent={true}
        >
            <SafeAreaView className='flex-1 bg-black/40 ' edges={['top']}>
                <ScrollView>
                    <View className='rounded-3xl bg-[#1a1d26] border border-[#3a3d4a]'>

                        <View className='flex flex-row justify-between items-center border-b border-[#3a3d4a] p-4'>
                            <Text className='text-white font-bold text-xl'>Add Climb</Text>
                            <TouchableOpacity onPress={onClose}>
                                <X color={'white'} size={32} />
                            </TouchableOpacity>
                        </View>

                        <View className='p-4'>

                            <View className='flex flex-row mt-6 border bg-card border-[#3a3d4a] rounded-xl gap-2 items-center justify-center px-2 py-1'>
                                <TouchableOpacity
                                    className={`${addBoulders ? 'bg-primary' : 'bg-card'} w-1/2 py-3 rounded-xl`}
                                    onPress={() => {
                                        setAddBoulder(true)
                                        setAddRoutes(false)
                                    }}
                                >
                                    <Text className={`${addBoulders ? 'text-white' : 'text-muted-foreground'} text-lg font-bold text-center`}>Boulders</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`${addRoutes ? 'bg-primary' : 'bg-card'} w-1/2 py-3 rounded-xl`}
                                    onPress={() => {
                                        setAddBoulder(false)
                                        setAddRoutes(true)
                                    }}
                                >
                                    <Text className={`${addRoutes ? 'text-white' : 'text-muted-foreground'} text-lg font-bold text-center`}>Routes</Text>
                                </TouchableOpacity>
                            </View>


                            <View className='gap-2 mt-4 border border-[#3a3d4a] bg-card rounded-xl mx-auto'>
                                <Text className='text-lg font-bold text-muted-foreground left-4 top-2'>Grade</Text>
                                <View className='flex flex-row flex-wrap gap-2 p-2 mt-2'>
                                    {grades.map((grade) => (
                                        <TouchableOpacity
                                            key={grade}
                                            className={`${selectedGrade === grade ? 'bg-primary' : 'bg-[#1a1d26]'} w-[23%] p-4 rounded-lg border border-[#3a3d4a]`}
                                            onPress={() => setSelectedGrade(grade)}
                                        >
                                            <Text className={`${selectedGrade === grade ? 'text-white' : 'text-muted-foreground'} text-center font-bold`}>{grade}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>


                            <View className='mt-4 border border-[#3a3d4a] bg-card rounded-xl'>
                                <Text className='text-lg text-muted-foreground font-bold left-4 top-2'>Wall Type</Text>
                                <View className='flex flex-row gap-4 mt-2 p-2'>
                                    {[{
                                        type: 'overhang' as WallType,
                                        label: 'Overhang',
                                        icon: '⟍'
                                    },
                                    {
                                        type: 'vertical' as WallType,
                                        label: 'Vertical',
                                        icon: '|',
                                    },
                                    {
                                        type: 'slab' as WallType,
                                        label: 'Slab',
                                        icon: '⟋',
                                    }].map(({ type, label, icon }) => (
                                        <TouchableOpacity
                                            key={type}
                                            className={`${selectedWallType === type ? 'bg-primary' : 'bg-[#1a1d26]'} p-4 w-[30%] rounded-lg border border-[#3a3d4a] flex items-center justify-center gap-2 py-6 px-4`}
                                            onPress={() => setSelectedWallType(type)}
                                        >
                                            <Text className='text-white text-4xl'>{icon}</Text>
                                            <Text className='text-white text-sm'>{label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className='mt-4 border border-[#3a3d4a] bg-card rounded-xl'>
                                <Text className='text-lg text-muted-foreground font-bold top-2 left-4'>Attempts</Text>
                                <View className='flex flex-row justify-center items-center gap-8 mt-6 mb-4'>

                                    <TouchableOpacity
                                        className='rounded-full flex items-center justify-center p-4 bg-[#1a1d26]  border border-[#3a3d4a]'
                                        onPress={() => setAttempts(Math.max(attempts - 1, 1))}
                                    >
                                        <Minus size={24} color={'white'} />
                                    </TouchableOpacity>

                                    <Text className='text-white font-bold text-4xl'>{attempts}</Text>

                                    <TouchableOpacity
                                        className='rounded-full flex items-center justify-center p-4 bg-primary'
                                        onPress={() => setAttempts(attempts + 1)}
                                    >
                                        <Plus size={24} color={'white'} />
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <View className='mt-4 border border-[#3a3d4a] bg-card rounded-xl px-4'>
                                <Text className='text-lg text-muted-foreground font-bold top-2'>Notes</Text>
                                <View className='flex flex-row items-center mt-6 mb-4 border border-[#3a3d4a] rounded-xl'>

                                    <TextInput
                                        className='flex-1 text-white text-base px-2 py-1 items-center h-32'
                                        placeholder='Notes on moves, attempts, etc'
                                        placeholderTextColor='#6B7280'
                                        multiline={true}
                                        numberOfLines={10}
                                        textAlignVertical='top'

                                    />
                                </View>
                            </View>

                            <View className='mt-4 mb-4'>
                                <TouchableOpacity className='bg-primary rounded-xl py-3' onPress={onSave}>
                                    <Text className='text-white font-bold text-xl text-center'>Save Climb</Text>
                                </TouchableOpacity>
                            </View>

                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}

export default AddClimbModal