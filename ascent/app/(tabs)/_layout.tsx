import { Tabs } from 'expo-router'
import { Images, MessageCircle, Search, User, NotebookIcon } from 'lucide-react-native'

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ff7a3d',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#1a1d26',
                    borderTopWidth: 1,
                    borderTopColor: '#3a3d4a',
                    height: 84,
                },
                headerShown: false
            }}>
            <Tabs.Screen
                name='Posts'
                options={{
                    tabBarIcon: ({ color }) => (
                        <Images size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name='Messages'
                options={{
                    tabBarIcon: ({ color }) => (
                        <MessageCircle size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name='SearchScreen'
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color }) => (
                        <Search size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name='Journal'
                options={{
                    tabBarIcon: ({ color }) => (
                        <NotebookIcon size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name='Profile'
                options={{
                    tabBarIcon: ({ color }) => (
                        <User size={24} color={color} />
                    )
                }}
            />
        </Tabs>
    )
}

export default TabsLayout