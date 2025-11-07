import CustomButton from '@/components/common/CustomButton';
import FormField from '@/components/common/FormField';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const loginImage = require('../assets/images/library.jpg');
const logo = require('../assets/images/logoSinTitle.png');

const Login = () => {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = () => {
        // Aquí irá la lógica de login (hablar con Django)
        if (!form.email || !form.password) {
            Alert.alert('Error', 'Por favor, rellena todos los campos');
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            router.replace('/library')
        }, 2000);
    }

    return (
        <SafeAreaView className='bg-background h-full'>
            <ScrollView>
                <View className='w-full justify-center min-h-[90hv] px-6 py-4'>
                    {/* Logo Versory */}
                    <Image
                        source={logo}
                        className='w-48 h-20'
                        resizeMode='contain'
                    />
                    <Text className='text-3xl text-text-dark font-lora text-center mt-10'>
                        Bienvenido a Versory
                    </Text>

                    {/* Formulario */}
                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({ ...form, email: e })}
                        otherStyles='mt-7'
                        keyboardType='email-address'
                        placeholder='tuemail@ejemplo.com'
                    />

                    <FormField
                        title="Contraseña"
                        value={form.password}
                        handleChangeText={(e) => setForm({ ...form, password: e })}
                        otherStyles='mt-4'
                    />

                    <CustomButton
                        title="Iniciar Sesión"
                        handlePress={submit}
                        containerStyles='mt-7'
                        isLoading={isSubmitting}
                    />

                    {/* Botones Social Login */}
                    <View className='mt-5'>
                        <Text className='text-center text-text-light font-montserrat'>
                            O inicia sesión con
                        </Text>
                    </View>

                    {/* Redirigir a Registrarse */}
                    <View className='justify-center pt-5 flex-row gap-2'>
                        <Text className='text-text-light font-montserrat'>
                            ¿No tienes una cuenta?
                        </Text>
                        <Link href="/register" className='font-montserrat-medium text-accent-dark'>
                            Regístrate
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Login;