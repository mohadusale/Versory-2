import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface FormFieldProps extends TextInputProps {
    title: string;
    value: string;
    placeholder?: string;
    handleChangeText: (text: string) => void;
    otherStyles?: string;
}

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }: FormFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = title.toLowerCase() === 'contraseña' || title.toLowerCase() === 'password';
    
    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className='text-base text-text-light font-montserrat-medium'>
                {title}
            </Text>

            <View className='w-full h-14 px-4 bg-background border-2 border-primary rounded-xl focus:border-accent flex-row items-center'>
                <TextInput 
                    className='flex-1 text-text-dark text-base font-montserrat'
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#8A817C"
                    onChangeText={handleChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />

                {/* Si es contraseña, muestra el icono de "ver" */}
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={!showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={24}
                            color="#463F3A"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default FormField