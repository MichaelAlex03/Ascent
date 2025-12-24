import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { Climb } from '@/types/app'
import { X, Calendar, Layers, TrendingUp } from 'lucide-react-native'

interface ClimbEntryModalProps {
  climb: Climb;
  visible: boolean;
  onClose: () => void;
}

const ClimbEntryModal = ({ climb, visible, onClose }: ClimbEntryModalProps) => {
  if (!climb) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
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
    <Modal
      visible={visible}
      animationType='slide'
      transparent={false}
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-[#1a1d26]'>
        {/* Header */}
        <View className='flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-[#3a3d4a]'>
          <Text className='text-white text-xl font-bold'>Climb Details</Text>
          <TouchableOpacity
            onPress={onClose}
            className='p-2 rounded-full bg-[#272a35]'
            activeOpacity={0.7}
          >
            <X size={24} color='#94a3b8' />
          </TouchableOpacity>
        </View>

        <ScrollView
          className='flex-1'
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className='p-6'>
            {/* Grade Badge - Hero Section */}
            <View className='items-center mb-8'>
              <View className='bg-primary px-8 py-6 rounded-3xl shadow-lg'>
                <Text className='text-white font-bold text-5xl'>{climb.grade}</Text>
              </View>
              <Text className='text-muted-foreground text-sm mt-3 uppercase tracking-wide'>
                {climb.climb_type === 'boulder' ? 'Boulder Problem' : 'Route'}
              </Text>
            </View>

            {/* Details Cards */}
            <View className='space-y-3 mb-6'>
              {/* Date Card */}
              <View className='flex-row items-center bg-[#272a35] rounded-xl p-4 border border-[#3a3d4a]'>
                <View className='bg-[#1a1d26] p-3 rounded-lg mr-4'>
                  <Calendar size={24} color='#94a3b8' />
                </View>
                <View className='flex-1'>
                  <Text className='text-muted-foreground text-xs uppercase mb-1 tracking-wide'>Date Climbed</Text>
                  <Text className='text-white text-base font-semibold'>{formatDate(climb.date_climbed)}</Text>
                </View>
              </View>

              {/* Wall Type Card */}
              <View className='flex-row items-center bg-[#272a35] rounded-xl p-4 border border-[#3a3d4a]'>
                <View className='bg-[#1a1d26] p-3 rounded-lg mr-4'>
                  <Layers size={24} color={getWallTypeColor(climb.climb_wall_type)} />
                </View>
                <View className='flex-1'>
                  <Text className='text-muted-foreground text-xs uppercase mb-1 tracking-wide'>Wall Type</Text>
                  <Text className='text-white text-base font-semibold'>{capitalizeFirst(climb.climb_wall_type)}</Text>
                </View>
              </View>

              {/* Attempts Card */}
              <View className='flex-row items-center bg-[#272a35] rounded-xl p-4 border border-[#3a3d4a]'>
                <View className='bg-[#1a1d26] p-3 rounded-lg mr-4'>
                  <TrendingUp size={24} color='#ff7a3d' />
                </View>
                <View className='flex-1'>
                  <Text className='text-muted-foreground text-xs uppercase mb-1 tracking-wide'>Total Attempts</Text>
                  <Text className='text-white text-base font-semibold'>
                    {climb.climb_attempts} {climb.climb_attempts === 1 ? 'attempt' : 'attempts'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Notes Section */}
            {climb.climb_notes && (
              <View className='bg-[#272a35] rounded-2xl p-5 border border-[#3a3d4a]'>
                <Text className='text-white font-bold text-lg mb-3'>Notes</Text>
                <View className='bg-[#1a1d26] rounded-xl p-4'>
                  <Text className='text-muted-foreground text-base leading-7'>
                    {climb.climb_notes}
                  </Text>
                </View>
              </View>
            )}

            {/* Empty State for No Notes */}
            {!climb.climb_notes && (
              <View className='bg-[#272a35] rounded-2xl p-5 border border-[#3a3d4a] items-center'>
                <Text className='text-muted-foreground text-sm italic'>No notes recorded for this climb</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default ClimbEntryModal