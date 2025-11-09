import CustomButton from '@/components/common/CustomButton';
import FormField from '@/components/common/FormField';
import { useAuth } from '@/hooks/useAuth';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../assets/images/logoSinTitle2.png');

const Register = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const { register, isLoading } = useAuth();

    const isRegisterValid = 
        form.username.trim() !== '' &&
        form.email.trim() !== '' &&
        form.password.trim() !== '' &&
        form.confirmPassword.trim() !== '';

    const submit = async () => {
        // Lógica de registro
        if (!isRegisterValid) {
            Alert.alert('Error', 'Por favor, rellena todos los campos');
            return;
        }

        if (form.password !== form.confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        // Aquí iría la lógica de validación de username

        await register(form.username, form.email, form.password);
    }

    return (
        <SafeAreaView className='bg-background flex-1'>
            <KeyboardAwareScrollView
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={{ flexGrow: 1 }}
                enableOnAndroid={true}
            >
                <View className='w-full justify-center px-6 py-4'>
                    <Image
                        source={logo}
                        className='w-48 h-20 self-center'
                        resizeMode='contain'
                    />

                    <Text className='text-2xl text-text-dark font-lora text-center mt-10'>
                        Inicia tu aventura en Versory
                    </Text>

                    {/* Formulario */}
                    <FormField
                        title="Username"
                        value={form.username}
                        handleChangeText={(e) => setForm({ ...form, username: e })}
                        otherStyles='mt-10'
                        autoCapitalize='none'
                        placeholder='Así te verán otros lectores. Debe ser único.'
                    />

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({ ...form, email: e })}
                        otherStyles='mt-4'
                        keyboardType='email-address'
                        placeholder='tuemail@ejemplo.com'
                    />

                    <FormField
                        title="Contraseña"
                        value={form.password}
                        handleChangeText={(e) => setForm({ ...form, password: e })}
                        otherStyles='mt-4'
                    />

                    <FormField
                        title="Confirmar Contraseña"
                        value={form.confirmPassword}
                        handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
                        otherStyles='mt-4 pb-5'
                    />
                </View>
            </KeyboardAwareScrollView>
            <View className='bg-background px-6 pt-4 pb-6 border-t border-primary'>
                <CustomButton
                    title="Registrarse"
                    handlePress={submit}
                    isLoading={isLoading}
                    disabled={!isRegisterValid || isLoading}
                />

                <View className="justify-center pt-5 flex-row gap-2">
                    <Text className="text-text-light font-montserrat">
                        ¿Ya tienes una cuenta?
                    </Text>
                    <Link href="/login" className="font-montserrat-medium text-accent">
                    Inicia Sesión
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Register;