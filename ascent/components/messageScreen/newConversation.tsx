import { View, Text, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useCallback } from 'react'
import { Search } from 'lucide-react-native'

interface NewConvoProps {
    visible: boolean;
    onClose: () => void
}

const NewConversation = ({ visible, onClose }: NewConvoProps) => {

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState();
    const [suggestedConvos, setSuggestedConvos] = useState();
    const [selectedUser, setSelectedUsers] = useState<string>('');

    const fetchFollowedUsers = async () => {

    }

    // const handleSearch = useCallback(async () => {
    //     if (searchQuery.trim().length === 0) return;

    //     setLoading(true);
    //     try {
    //         const token = await getToken();
    //         const response = await fetch(
    //             `${process.env.EXPO_PUBLIC_USER_API}/users/search?q=${encodeURIComponent(searchQuery)}`,
    //             {
    //                 method: 'GET',
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     'Content-Type': 'application/json',
    //                 },
    //             }
    //         );

    //         if (response.ok) {
    //             const data = await response.json();
    //             setResults(data);

    //             // Check following status for all results
    //             data.forEach((user: UserSearchResult) => {
    //                 checkFollowingStatus(user.clerk_id);
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Search error:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [searchQuery]);

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            animationType='slide'
            transparent={true}
            statusBarTranslucent={true}
        >
            <SafeAreaView className='flex-1 bg-black/40' edges={['top']}>
                <View className='flex-1 bg-[#1a1d26] rounded-t-3xl p-4 mt-16'>

                    <View className='flex flex-row items-center justify-center relative'>
                        <TouchableOpacity
                            onPress={onClose}
                            className='absolute left-0'
                        >
                            <Text className='text-white text-base'>Cancel</Text>
                        </TouchableOpacity>

                        <Text className=' text-white font-bold text-lg'>New Message</Text>
                    </View>

                    <View>
                        <FlatList

                            ListHeaderComponent={() => (
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
                            )}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default NewConversation