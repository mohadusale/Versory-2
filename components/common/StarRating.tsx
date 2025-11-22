import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface StarRatingProps {
    rating: number;
    onRate?: (rating: number) => void;
    size?: number;
    color?: string;
    containerStyle?: any;
    showText?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRate,
    size = 40,
    color = "#E0AFA0",
    containerStyle,
    showText = false
}) => {
    // Asegurar que rating sea un número válido, por defecto 0
    // Manejar caso donde rating viene como string desde el backend
    const parsedRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const safeRating = typeof parsedRating === 'number' && !isNaN(parsedRating) ? parsedRating : 0;
    const [currentRating, setCurrentRating] = useState(safeRating);

    useEffect(() => {
        const parsed = typeof rating === 'string' ? parseFloat(rating) : rating;
        const safe = typeof parsed === 'number' && !isNaN(parsed) ? parsed : 0;
        setCurrentRating(safe);
    }, [rating]);

    const handleStarPress = (starValue: number) => {
        if (!onRate) return;

        // Si tocas la misma estrella, añade/quita 0.5
        let newRating: number;
        if (currentRating === starValue) {
            // Si es estrella completa, pasa a media estrella
            newRating = starValue - 0.5;
        } else if (currentRating === starValue - 0.5) {
            // Si es media estrella, pasa a estrella completa
            newRating = starValue;
        } else {
            // Si es diferente, pon estrella completa
            newRating = starValue;
        }

        // Asegurar rango entre 0.5 y 5
        newRating = Math.max(0.5, Math.min(5, newRating));

        setCurrentRating(newRating);
        onRate(newRating);

        // Feedback háptico suave
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const renderStars = () => {
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            let iconName: keyof typeof Ionicons.glyphMap = 'star-outline';

            if (currentRating >= i) {
                iconName = 'star';
            } else if (currentRating >= i - 0.5) {
                iconName = 'star-half';
            }

            stars.push(
                <Pressable
                    key={i}
                    onPress={() => handleStarPress(i)}
                    disabled={!onRate}
                    style={({ pressed }) => [
                        styles.starButton,
                        pressed && styles.starPressed
                    ]}
                >
                    <Ionicons
                        name={iconName}
                        size={size}
                        color={color}
                    />
                </Pressable>
            );
        }
        return stars;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.starsRow}>
                {renderStars()}
            </View>

            {showText && (
                <Text style={styles.ratingText}>
                    {currentRating.toFixed(1)} / 5.0
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 4,
    },
    starButton: {
        padding: 4, // Aumenta el área táctil
        justifyContent: 'center',
        alignItems: 'center',
    },
    starPressed: {
        opacity: 0.6,
        transform: [{ scale: 0.95 }],
    },
    ratingText: {
        color: '#E0AFA0',
        fontFamily: 'Montserrat_700Bold',
        fontSize: 20,
        marginTop: 8,
    }
});

export default StarRating;