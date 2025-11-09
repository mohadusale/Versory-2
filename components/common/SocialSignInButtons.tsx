//import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
//import * as AppleAuthentication from 'expo-apple-authentication';
import React from 'react';
import { Platform, Text, View } from 'react-native';

interface SocialSignInButtonsProps {
    onGooglePress: () => void;
    onApplePress: () => void;
    isSubmitting: boolean;
}

const SocialSignInButtons = ({ onGooglePress, onApplePress, isSubmitting }: SocialSignInButtonsProps) => {

    return (
        <View className="w-full mt-7 space-y-4">
            <View className="flex-row items-center space-x-2">
                <View className="flex-1 h-px bg-primary" />
                    <Text className="text-center text-text-light font-montserrat">
                        O continúa con
                    </Text>
                <View className="flex-1 h-px bg-primary" />
            </View>

            {/* Botón de Google */}
            {/* <GoogleSigninButton
                style={{ width: '100%', height: 56 }}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Light} // El botón estándar "Sign in with Google"
                onPress={onGooglePress}
                disabled={isSubmitting}
            />

            {/* Botón de Apple (SOLO se muestra en dispositivos iOS) */}
            {/* {Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={8}
                    style={{ width: '100%', height: 56 }}
                    onPress={onApplePress}
                />
            )} */}
        </View>
    );
}

export default SocialSignInButtons;