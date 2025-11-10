import { UserBook } from '@/types/types';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface BookItemProps {
    item: UserBook;
}

const BookItem: React.FC<BookItemProps> = ({ item }) => (
    <Link href={`/books/${item.book.isbn}`} asChild>
        <TouchableOpacity className="flex-row p-4 active:opacity-70 active:bg-stone-100">
            {/* Portada */}
            <Image
                source={{ uri: item.book.cover_url || 'https://placehold.co/80x128/292524/6B6664?text=No+Cover' }}
                className="w-20 h-32 rounded-md bg-stone-700"
                resizeMode="cover"
            />
            {/* Info del Libro */}
            <View className="flex-1 ml-4 justify-center">
                <Text className="text-lg font-lora-semibold text-text-dark mb-1" numberOfLines={2}>
                    {item.book.title}
                </Text>
                <Text className="text-sm font-montserrat text-text-light mb-2">
                    {item.book.authors.map(a => a.name).join(', ')}
                </Text>
                {/* Mostramos el rating solo si está finalizado */}
                {item.status === 'FN' && item.rating && (
                    <View className="flex-row items-center">
                        {/* Aquí iría un componente de Estrellas, por ahora texto */}
                        <Text className="text-sm font-montserrat-medium text-accent">
                            ★ {item.rating} / 5.0
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    </Link>
);

export default BookItem;

