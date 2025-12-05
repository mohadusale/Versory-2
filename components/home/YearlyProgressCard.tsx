import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

interface YearlyProgressCardProps {
    read: number;
    goal: number;
    year: number;
    onPress?: () => void; // Para permitir cambiar la meta en el futuro
}

const YearlyProgressCard: React.FC<YearlyProgressCardProps> = ({ read, goal, year, onPress }) => {
    const percentage = Math.min(Math.round((read / goal) * 100), 100);

    return (
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 shadow-sm border border-primary/10 flex-1 ml-2 justify-between"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="text-xs font-montserrat text-text-light uppercase tracking-wider mb-1">
                        Reto {year}
                    </Text>
                    <Text className="text-lg font-lora text-text-dark">
                        <Text className="text-accent">{read}</Text>
                        <Text className="text-base text-text-light">/{goal} libros</Text>
                    </Text>
                </View>
                <Ionicons name="trophy-outline" size={20} color="#E0AFA0" />
            </View>

            {/* Barra de Progreso */}
            <View className="w-full">
                <View className="flex-row justify-between mb-1">
                    <Text className="text-[10px] font-montserrat-medium text-text-dark">
                        {percentage}%
                    </Text>
                </View>
                <View className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <View 
                        className="h-full bg-accent rounded-full" 
                        style={{ width: `${percentage}%` }} 
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default YearlyProgressCard;