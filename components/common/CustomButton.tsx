import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface CustomButtonProps extends TouchableOpacityProps {
    title: string;
    handlePress: () => void;
    containerStyles?: string;
    textStyles?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading, disabled, ...props}: CustomButtonProps) => {
    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            className={`
                bg-accent 
                rounded-xl 
                min-h-[56px] 
                justify-center 
                items-center 
                ${containerStyles} 
                ${disabled || isLoading ? 'bg-primary' : 'bg-accent'}
                ${isLoading ? 'opacity-50' : ''
            }`}
            disabled={disabled || isLoading}
            {...props}
        >
            <Text className={`text-text-dark font-montserrat-bold text-lg ${textStyles}`}>
                {title}
            </Text>
        </TouchableOpacity>
    )
}

export default CustomButton