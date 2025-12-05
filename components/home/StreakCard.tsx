import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

interface StreakCardProps {
    streak: number;
    activityDates: string[];
}

const StreakCard: React.FC<StreakCardProps> = ({ streak, activityDates }) => {
    // Calcular los últimos 7 días para mostrar las "bolitas"
    const last7Days = useMemo(() => {
        const days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            
            days.push({
                dayName: d.toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase(), // L, M, X...
                isActive: activityDates.includes(dateString),
                isToday: i === 0
            });
        }
        return days;
    }, [activityDates]);

    return (
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-primary/10 flex-1 mr-2">
            {/* Encabezado: Icono y Contador */}
            <View className="flex-row items-center mb-3">
                <View className={`p-2 rounded-full mr-3 ${streak > 0 ? 'bg-orange-100' : 'bg-stone-100'}`}>
                    <Ionicons 
                        name="flame" 
                        size={24} 
                        color={streak > 0 ? "#F97316" : "#A8A29E"} 
                    />
                </View>
                <View>
                    <Text className="text-2xl font-lora text-text-dark leading-7">
                        {streak}
                    </Text>
                    <Text className="text-xs font-montserrat text-text-light uppercase tracking-wider">
                        Días Racha
                    </Text>
                </View>
            </View>

            {/* Mini Calendario (Últimos 7 días) */}
            <View className="flex-row justify-between pt-2 border-t border-primary/10">
                {last7Days.map((day, index) => (
                    <View key={index} className="items-center gap-1">
                        <Text className="text-[10px] font-montserrat text-text-light">
                            {day.dayName}
                        </Text>
                        <View 
                            className={`w-2.5 h-2.5 rounded-full ${
                                day.isActive 
                                    ? 'bg-accent' 
                                    : day.isToday 
                                        ? 'bg-primary/30 border border-primary' // Hoy pero no leído aún
                                        : 'bg-stone-200'
                            }`} 
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

export default StreakCard;