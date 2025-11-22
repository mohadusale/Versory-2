import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

const TabIcon = ({ iconName, focused }: { iconName: keyof typeof Ionicons.glyphMap, focused: boolean }    ) => {
    return <Ionicons name={iconName} size={24} color={focused ? '#E0AFA0' : '#8A817C'} />;
};

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#F4F3EE',
                    borderTopColor: '#BCB8B1',
                    borderTopWidth: 1,
                    minHeight: 70,
                }
            }}
        >
            {/* Home */}
            <Tabs.Screen 
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }: { focused: boolean }) => (
                        <TabIcon iconName={focused ? 'home' : 'home-outline'} focused={focused} />
                    ),
                }}
            />

            {/* Explore */}
            <Tabs.Screen 
                name="explore"
                options={{
                    title: 'Explore',
                    headerShown: false,
                    tabBarIcon: ({ focused }: { focused: boolean }) => (
                        <TabIcon iconName={focused ? 'search' : 'search-outline'} focused={focused} />
                    ),
                }}
            />

            {/* Library */}
            <Tabs.Screen 
                name="library"
                options={{
                    title: 'Library',
                    headerShown: false,
                    tabBarIcon: ({ focused }: { focused: boolean }) => (
                        <TabIcon iconName={focused ? 'library' : 'library-outline'} focused={focused} />
                    ),
                }}
            />

            {/* Profile */}
            <Tabs.Screen 
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }: { focused: boolean }) => (
                        <TabIcon iconName={focused ? 'person' : 'person-outline'} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    )
}

export default TabsLayout      