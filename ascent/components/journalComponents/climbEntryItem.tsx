import { View, Text, TouchableOpacity } from 'react-native'
import { Calendar, TrendingUp, Layers, ChevronRight } from 'lucide-react-native'
import { Climb } from '@/types/app'
import { useState } from 'react';

interface ClimbEntryItem{
    item: Climb
    setToggleViewClimb: React.Dispatch<React.SetStateAction<boolean>>
    setActiveClimb: React.Dispatch<React.SetStateAction<Climb>>
}


export const climbEntryItem = ({ item, setToggleViewClimb, setActiveClimb  }: ClimbEntryItem) => {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const diffTime = nowOnly.getTime() - dateOnly.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getWallTypeColor = (wallType: string) => {
        switch (wallType) {
            case 'slab': return '#3b82f6';
            case 'vertical': return '#10b981';
            case 'overhang': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    const capitalizeFirst = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };



    return (
        <TouchableOpacity
            className='mx-4 mb-4 bg-[#272a35] border border-[#3a3d4a] rounded-xl p-4'
            onPress={() => {
                setToggleViewClimb(true);
                setActiveClimb(item);
            }}
        >

            <View className='flex-row items-center justify-between mb-3'>
                <View className='bg-primary px-4 py-2 rounded-lg'>
                    <Text className='text-white font-bold text-xl'>{item.grade}</Text>
                </View>
                <View className='flex-row items-center gap-2'>
                    <Calendar size={16} color='#94a3b8' />
                    <Text className='text-muted-foreground text-sm'>{formatDate(item.date_climbed)}</Text>
                </View>
            </View>


            <View className='flex-row items-center gap-4 mb-3'>

                <View className='flex-row items-center gap-2'>
                    <Layers size={16} color={getWallTypeColor(item.climb_wall_type)} />
                    <Text className='text-white text-sm font-medium'>{capitalizeFirst(item.climb_wall_type)}</Text>
                </View>


                <View className='flex-row items-center gap-2'>
                    <TrendingUp size={16} color='#ff7a3d' />
                    <Text className='text-white text-sm font-medium'>
                        {item.climb_attempts} {item.climb_attempts === 1 ? 'attempt' : 'attempts'}
                    </Text>
                </View>
            </View>

            {item.climb_notes && (
                <View className='bg-[#1a1d26] rounded-lg p-3 mt-2'>
                    <Text
                        className='text-muted-foreground text-sm italic'
                        numberOfLines={2}
                    >
                        {item.climb_notes}
                    </Text>
                    {item.climb_notes.length > 80 && (
                        <View className='flex-row items-center justify-between mt-2'>
                            <Text className='text-primary text-xs font-semibold'>
                                View full details
                            </Text>
                            <ChevronRight size={14} color='#ff7a3d' />
                        </View>
                    )}
                </View>

            )}
        </TouchableOpacity>
    )
};