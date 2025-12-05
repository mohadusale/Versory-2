import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UserBook } from '@/types/types';

interface CurrentReadCardProps {
    item: UserBook;
}

const CurrentReadCard: React.FC<CurrentReadCardProps> = ({ item }) => {
    // Calcular porcentaje asegurando que sean números válidos
    const totalPages = item.book.pages_count || 1; 
    const readPages = item.pages_read || 0;
    const progress = Math.min(Math.round((readPages / totalPages) * 100), 100);

    return (
        <Link href={`/(stack)/books/${item.id}`} asChild>
            <TouchableOpacity 
                activeOpacity={0.9}
                className="bg-white rounded-2xl p-4 shadow-sm border border-primary/20 flex-row"
            >
                {/* Portada */}
                <View className="shadow-md">
                    <Image
                        source={{ uri: item.book.cover_url || 'https://placehold.co/120x184/292524/6B6664?text=No+Cover' }}
                        className="w-24 h-36 rounded-md bg-stone-200"
                        resizeMode="cover"
                    />
                </View>

                {/* Info y Progreso */}
                <View className="flex-1 ml-4 justify-between py-1">
                    <View>
                        
                        <Text 
                            className="text-lg font-lora text-text-dark leading-6 mb-1" 
                            numberOfLines={2}
                        >
                            {item.book.title}
                        </Text>
                        <Text 
                            className="text-sm font-montserrat text-text-light" 
                            numberOfLines={1}
                        >
                            {item.book.authors[0]?.name || 'Autor desconocido'}
                        </Text>
                    </View>

                    {/* Barra de Progreso */}
                    <View>
                        <View className="flex-row justify-between mb-1.5">
                            <Text className="text-xs font-montserrat-medium text-text-dark">
                                {progress}% Completo
                            </Text>
                            <Text className="text-xs font-montserrat text-text-light">
                                {readPages}/{totalPages} pág.
                            </Text>
                        </View>
                        
                        <View className="h-2 bg-stone-200 rounded-full overflow-hidden">
                            <View 
                                className="h-full bg-accent rounded-full" 
                                style={{ width: `${progress}%` }} 
                            />
                        </View>
                    </View>
                </View>
                
                {/* Icono flecha */}
                <View className="justify-center pl-1">
                    <Ionicons name="chevron-forward" size={20} color="#BCB8B1" />
                </View>
            </TouchableOpacity>
        </Link>
    );
};

export default CurrentReadCard;