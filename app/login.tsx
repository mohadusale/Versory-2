import CustomButton from '@/components/common/CustomButton';
import FormField from '@/components/common/FormField';
// import SocialSignInButtons from '@/components/common/SocialSignInButtons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

const loginImage = require('../assets/images/library.jpg');
const logo = require('../assets/images/logoSinTitle2.png');

const Login = () => {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoginValid = form.email.trim() !== '' && form.password.trim() !== '';

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

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        Alert.alert('Google', 'Iniciando sesión con Google...');
        // Aquí iría la lógica de GoogleSignin.signIn() y la llamada a Django
        setTimeout(() => {
            setIsSubmitting(false);
            router.replace('/library');
        }, 1500);
    }

    const handleAppleLogin = async () => {
        setIsSubmitting(true);
        Alert.alert('Apple', 'Iniciando sesión con Apple...');
        // Aquí iría la lógica de GoogleSignin.signIn() y la llamada a Django
        setTimeout(() => {
            setIsSubmitting(false);
            router.replace('/library');
        }, 1500);
    }

    return (
        <SafeAreaView className='bg-background flex-1'>
            <KeyboardAwareScrollView
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={{ flexGrow: 1 }}
                enableOnAndroid={true}
            >
                <View className='w-full justify-center flex-1 px-6 py-4'>
                    {/* Logo Versory */}
                    <Image
                        source={logo}
                        className='w-48 h-20 self-center'
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

                    {/* He olvidado la contraseña */}
                    <View className='item-end mt-4'>
                        <Link href={"/forgot-password"}>
                            <Text className='text-text-light font-montserrat-medium text-xs'>
                                ¿Has olvidado tu contraseña?
                            </Text>
                        </Link>
                    </View>

                    <CustomButton
                        title="Iniciar Sesión"
                        handlePress={submit}
                        containerStyles='mt-7'
                        isLoading={isSubmitting}
                        disabled={!isLoginValid}
                    />

                    {/* Botones Social Login */}
                    {/* <SocialSignInButtons
                        isSubmitting={isSubmitting}
                        onGooglePress={handleGoogleLogin}
                        onApplePress={handleAppleLogin}
                    /> */}

                    {/* Redirigir a Registrarse */}
                    <View className='justify-center pt-5 flex-row gap-2'>
                        <Text className='text-text-light font-montserrat'>
                            ¿No tienes una cuenta?
                        </Text>
                        <Link href="/register" className='font-montserrat-medium text-accent'>
                            Regístrate
                        </Link>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default Login;