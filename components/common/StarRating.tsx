import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface StarRatingProps {
    rating: number; // Puede ser decimal
    onRate?: (rating: number) => void; // Si existe, es interactivo
    size?: number;
    color?: string;
    containerStyle?: string;
    showText?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
    rating, 
    onRate, 
    size = 24, 
    color = "#E0AFA0",
    containerStyle = "",
    showText = false
}) => {
    // Generamos un array [1, 2, 3, 4, 5]
    const stars = [1, 2, 3, 4, 5];

    const handlePress = (starValue: number) => {
        if (onRate) {
            // Si pulsamos la misma estrella que ya tenemos, bajamos a media estrella
            // Si ya tenemos media estrella, la quitamos o subimos (lógica simple por ahora: set value)
            // Para simplificar UX móvil: Toque = Valor entero. 
            // (Podríamos implementar lógica de mitades con LayoutEvent si quisieras más precisión futura)
            onRate(starValue);
        }
    };

    return (
        <View className={`flex-row items-center ${containerStyle}`}>
            {stars.map((starValue) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'star-outline';
                
                if (rating >= starValue) {
                    iconName = 'star';
                } else if (rating >= starValue - 0.5) {
                    iconName = 'star-half';
                }

                return (
                    <TouchableOpacity 
                        key={starValue}
                        disabled={!onRate}
                        onPress={() => handlePress(starValue)}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name={iconName} 
                            size={size} 
                            color={color} 
                            style={{ marginRight: 2 }}
                        />
                    </TouchableOpacity>
                );
            })}
            {showText && rating > 0 && (
                <Text className="ml-2 text-lg font-montserrat-medium text-accent">
                    {rating}
                </Text>
            )}
        </View>
    );
};

export default StarRating;