import CustomButton from '@/components/common/CustomButton';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import React from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
    const { logout } = useAuth();

    const { user } = useAuthStore((state) => state);

    const handleLogout = async () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres cerrar sesión?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sí, cerrar sesión",
                    onPress: () => logout(),
                    style: "destructive"
                }
            ]
        );
    }

    return (
        <SafeAreaView className='bg-background flex-1'>
            <View className='flex-1 justify-between p-6'>
                <View className='items-center'>
                    <Text className='text-3xl font-lora text-text-dark mt-10'>
                        Perfil
                    </Text>
                    <Text className='text-lg font-montserrat text-text-light mt-2'>
                        Hola, {user ? `@${user.username}` : 'Usuario'}
                    </Text>
                </View>

                <View className='px-6'>
                    <CustomButton
                        title="Cerrar Sesión"
                        handlePress={handleLogout}
                        containerStyles='w-full '
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Profile;