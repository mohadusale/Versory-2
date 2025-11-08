import CustomButton from '@/components/common/CustomButton';
import FormField from '@/components/common/FormField';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../assets/images/logoSinTitle.png');

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = () => {
        // Lógica de registro
        if (!form.name || !form.email || !form.username || !form.password || !form.confirmPassword) {
            Alert.alert('Error', 'Por favor, rellena todos los campos');
            return;
        }

        if (form.password !== form.confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        // Aquí iría la lógica de validación de username

        setIsSubmitting(true);

        // Simulación de registro (aquí se llamaría a Django)
        console.log("Datos del formulario:", form);
        setTimeout(() => {
            setIsSubmitting(false);
            // Si el registro es exitoso, redirige a los tabs
            router.replace('/library');
        }, 2000)
    }

    return (
        <SafeAreaView className='bg-background h-full'>
            <KeyboardAwareScrollView
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View className='w-full justify-center min-h-[90vh] px-6 py-4'>
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
                        title="Nombre"
                        value={form.name}
                        handleChangeText={(e) => setForm({ ...form, name: e })}
                        otherStyles='mt-7'
                        placeholder='¿Cómo te llamas?'
                    />

                    <FormField
                        title="Username"
                        value={form.username}
                        handleChangeText={(e) => setForm({ ...form, username: e })}
                        otherStyles='mt-4'
                        placeholder='Ej: ana_reads'
                        autoCapitalize='none'
                    />
                    <Text className='text-xs text-text-light font-montserrat mt-2 ml-1'>
                        Así te verán otros lectores. Debe ser único.
                    </Text>

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
                        otherStyles='mt-4'
                    />

                    <CustomButton
                        title="Registrarse"
                        handlePress={submit}
                        containerStyles="mt-7"
                        isLoading={isSubmitting}
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
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default Register;