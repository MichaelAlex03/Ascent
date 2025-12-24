import { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { Search, UserPlus, UserCheck } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { UserSearchResult } from '@/types/app';

export default function SearchScreen() {
    const { getToken, userId } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                handleSearch();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        if (searchQuery.trim().length === 0) return;

        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_USER_API}/users/search?q=${encodeURIComponent(searchQuery)}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setResults(data);

                // Check following status for all results
                data.forEach((user: UserSearchResult) => {
                    checkFollowingStatus(user.clerk_id);
                });
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFollowingStatus = async (targetClerkId: string) => {
        try {
            const token = await getToken();
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_USER_API}/users/${targetClerkId}/is-following`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const { isFollowing } = await response.json();
                setFollowingStatus(prev => ({ ...prev, [targetClerkId]: isFollowing }));
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const handleFollowToggle = async (targetClerkId: string) => {
        const isCurrentlyFollowing = followingStatus[targetClerkId];

        try {
            const token = await getToken();
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_USER_API}/users/${targetClerkId}/follow`,
                {
                    method: isCurrentlyFollowing ? 'DELETE' : 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                setFollowingStatus(prev => ({
                    ...prev,
                    [targetClerkId]: !isCurrentlyFollowing
                }));
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const renderUserItem = ({ item }: { item: UserSearchResult }) => {
        const isOwnProfile = item.clerk_id === userId;
        const isFollowing = followingStatus[item.clerk_id];

        return (
            <Card className="bg-card border-border mb-3 p-4">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Avatar alt={item.full_name} className="w-12 h-12 mr-3">
                            {item.avatar_url && <AvatarImage source={{ uri: item.avatar_url }} />}
                            <AvatarFallback>
                                <Text className="text-white font-bold">
                                    {item.full_name?.charAt(0) || item.username?.charAt(0) || '?'}
                                </Text>
                            </AvatarFallback>
                        </Avatar>

                        <View className="flex-1">
                            <Text className="text-white font-semibold text-base">
                                {item.full_name || item.username}
                            </Text>
                            <Text className="text-muted-foreground text-sm">
                                @{item.username}
                            </Text>
                        </View>
                    </View>

                    {!isOwnProfile && (
                        <TouchableOpacity
                            onPress={() => handleFollowToggle(item.clerk_id)}
                            className={`px-4 py-2 rounded-lg ${
                                isFollowing ? 'bg-card border border-border' : 'bg-primary'
                            }`}
                        >
                            <View className="flex-row items-center gap-2">
                                {isFollowing ? (
                                    <UserCheck size={16} color="#94a3b8" />
                                ) : (
                                    <UserPlus size={16} color="white" />
                                )}
                                <Text className={isFollowing ? 'text-muted-foreground' : 'text-white'}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1a1d26]">
            <View className="p-4">
                {/* Search Header */}
                <Text className="text-white text-2xl font-bold mb-4">Search Climbers</Text>

                {/* Search Input */}
                <View className="flex-row items-center bg-[#272a35] border border-[#3a3d4a] rounded-xl px-4 py-3 mb-4">
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

                {/* Loading Indicator */}
                {loading && (
                    <View className="items-center py-8">
                        <ActivityIndicator size="large" color="#ff7a3d" />
                    </View>
                )}

                {/* Results List */}
                {!loading && results.length > 0 && (
                    <FlatList
                        data={results}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.clerk_id}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Empty State */}
                {!loading && searchQuery.trim().length > 0 && results.length === 0 && (
                    <View className="items-center justify-center mt-16 gap-4">
                        <View className="rounded-full bg-[#272a35] p-6">
                            <Search size={48} color="#64748b" />
                        </View>
                        <Text className="text-white font-bold text-lg">No users found</Text>
                        <Text className="text-muted-foreground">Try a different search term</Text>
                    </View>
                )}

                {/* Initial State */}
                {!loading && searchQuery.trim().length === 0 && (
                    <View className="items-center justify-center mt-16 gap-4">
                        <View className="rounded-full bg-[#272a35] p-6">
                            <Search size={48} color="#64748b" />
                        </View>
                        <Text className="text-white font-bold text-lg">Find Climbers</Text>
                        <Text className="text-muted-foreground">Search for friends to connect</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
