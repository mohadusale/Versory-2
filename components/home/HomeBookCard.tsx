import { UserBook } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface HomeBookCardProps {
    item: UserBook;
}

const HomeBookCard: React.FC<HomeBookCardProps> = ({ item }) => {
    return (
        <Link href={`/(stack)/books/${item.id}`} asChild>
            <TouchableOpacity 
                activeOpacity={0.7}
                className="mr-4" // Quitamos w-28 de aquí para que lo mande la imagen
            >
                {/* Portada */}
                <View className="shadow-sm mb-2">
                    <Image
                        source={{ uri: item.book.cover_url || 'https://placehold.co/120x184/292524/6B6664?text=No+Cover' }}
                        // Forzamos dimensiones exactas: w-28 = 112, ratio 2:3 -> h = 168
                        style={{ width: 112, height: 168, borderRadius: 8, backgroundColor: '#E7E5E4' }} 
                        contentFit="cover"
                        transition={200}
                    />
                    
                    {/* Badge de estado */}
                    <View className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm">
                        <Ionicons name="bookmark" size={10} color="#E0AFA0" />
                    </View>
                </View>

                {/* Título y Autor (Limitamos el ancho al de la imagen) */}
                <View style={{ width: 112 }}>
                    <Text 
                        className="font-lora text-sm text-text-dark leading-4 mb-0.5" 
                        numberOfLines={2}
                    >
                        {item.book.title}
                    </Text>
                    <Text 
                        className="font-montserrat text-xs text-text-light" 
                        numberOfLines={1}
                    >
                        {item.book.authors[0]?.name || 'Autor desconocido'}
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    );
};

export default HomeBookCard;