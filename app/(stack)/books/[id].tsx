/**
 * Pantalla de detalles de un libro
 */

import { useBookDetails } from '@/hooks/useBookDetails';
import { BOOK_STATUS_DISPLAY } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { book, isLoading, error, refresh } = useBookDetails(id || '');

    // Estado de carga
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#E0AFA0" />
                    <Text className="text-text-light font-montserrat mt-4">
                        Cargando libro...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Estado de error
    if (error || !book) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 justify-center items-center p-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#E0AFA0" />
                    <Text className="text-text-dark font-lora text-xl text-center mt-4">
                        No se pudo cargar el libro
                    </Text>
                    <Text className="text-text-light font-montserrat text-center mt-2">
                        {error?.message || 'El libro no fue encontrado'}
                    </Text>
                    <View className="flex-row gap-3 mt-6">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-primary/30 py-3 px-6 rounded-xl"
                            activeOpacity={0.7}
                        >
                            <Text className="text-text-dark font-montserrat-medium">
                                Volver
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => refresh()}
                            className="bg-accent py-3 px-6 rounded-xl"
                            activeOpacity={0.7}
                        >
                            <Text className="text-white font-montserrat-medium">
                                Reintentar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const { book: bookData, status, pages_read, rating, start_date, finished_date } = book;

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header con botón de volver */}
            <View className="flex-row items-center px-4 py-3 border-b border-primary/20">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-3"
                    activeOpacity={0.6}
                >
                    <Ionicons name="arrow-back" size={24} color="#463F3A" />
                </TouchableOpacity>
                <Text className="text-xl font-lora text-text-dark flex-1">
                    Detalles del libro
                </Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Portada y título */}
                <View className="items-center pt-6 pb-4 px-6">
                    <Image
                        source={{
                            uri: bookData.cover_url || 'https://placehold.co/300x450/292524/6B6664?text=Sin+Portada',
                        }}
                        style={{ width: 200, height: 300 }}
                        className="rounded-lg shadow-lg"
                        contentFit="cover"
                        transition={200}
                    />
                    
                    <Text className="text-2xl font-lora text-text-dark text-center mt-6">
                        {bookData.title}
                    </Text>

                    {/* Autores */}
                    {bookData.authors.length > 0 && (
                        <Text className="text-base font-montserrat text-text-light text-center mt-2">
                            {bookData.authors.map(a => a.name).join(', ')}
                        </Text>
                    )}

                    {/* Estado del libro */}
                    <View className="bg-accent/20 px-4 py-2 rounded-full mt-4">
                        <Text className="text-accent font-montserrat-medium">
                            {BOOK_STATUS_DISPLAY[status]}
                        </Text>
                    </View>
                </View>

                {/* Información adicional */}
                <View className="px-6 py-4">
                    {/* Grid de información */}
                    <View className="flex-row flex-wrap gap-3 mb-6">
                        {/* Páginas */}
                        <View className="bg-primary/10 px-4 py-3 rounded-xl flex-row items-center gap-2">
                            <Ionicons name="document-text-outline" size={20} color="#463F3A" />
                            <Text className="font-montserrat text-text-dark">
                                {bookData.pages_count} páginas
                            </Text>
                        </View>

                        {/* Año de publicación */}
                        {bookData.published_date && (
                            <View className="bg-primary/10 px-4 py-3 rounded-xl flex-row items-center gap-2">
                                <Ionicons name="calendar-outline" size={20} color="#463F3A" />
                                <Text className="font-montserrat text-text-dark">
                                    {new Date(bookData.published_date).getFullYear()}
                                </Text>
                            </View>
                        )}

                        {/* ISBN */}
                        <View className="bg-primary/10 px-4 py-3 rounded-xl flex-row items-center gap-2">
                            <Ionicons name="barcode-outline" size={20} color="#463F3A" />
                            <Text className="font-montserrat text-text-dark">
                                {bookData.isbn}
                            </Text>
                        </View>
                    </View>

                    {/* Progreso de lectura */}
                    {status === 'RD' && pages_read !== null && (
                        <View className="mb-6">
                            <Text className="text-lg font-lora text-text-dark mb-3">
                                Progreso de lectura
                            </Text>
                            <View className="bg-primary/10 p-4 rounded-xl">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="font-montserrat text-text-dark">
                                        {pages_read} de {bookData.pages_count} páginas
                                    </Text>
                                    <Text className="font-montserrat-medium text-accent">
                                        {Math.round((pages_read / bookData.pages_count) * 100)}%
                                    </Text>
                                </View>
                                {/* Barra de progreso */}
                                <View className="h-2 bg-primary/30 rounded-full overflow-hidden">
                                    <View 
                                        className="h-full bg-accent rounded-full"
                                        style={{ width: `${(pages_read / bookData.pages_count) * 100}%` }}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Valoración */}
                    {status === 'FN' && rating !== null && (
                        <View className="mb-6">
                            <Text className="text-lg font-lora text-text-dark mb-3">
                                Tu valoración
                            </Text>
                            <View className="flex-row items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                        key={star}
                                        name={star <= rating ? 'star' : 'star-outline'}
                                        size={32}
                                        color="#E0AFA0"
                                        style={{ marginRight: 4 }}
                                    />
                                ))}
                                <Text className="text-accent font-montserrat-medium text-lg ml-2">
                                    {rating}/5
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Fechas */}
                    {(start_date || finished_date) && (
                        <View className="mb-6">
                            <Text className="text-lg font-lora text-text-dark mb-3">
                                Fechas
                            </Text>
                            {start_date && (
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="play-circle-outline" size={20} color="#8A817C" />
                                    <Text className="font-montserrat text-text-light ml-2">
                                        Iniciado: {new Date(start_date).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            )}
                            {finished_date && (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#8A817C" />
                                    <Text className="font-montserrat text-text-light ml-2">
                                        Finalizado: {new Date(finished_date).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Géneros */}
                    {bookData.genres.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-lg font-lora text-text-dark mb-3">
                                Géneros
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {bookData.genres.map((genre) => (
                                    <View
                                        key={genre.id}
                                        className="bg-primary/20 px-3 py-1.5 rounded-full"
                                    >
                                        <Text className="font-montserrat text-text-dark text-sm">
                                            {genre.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Descripción */}
                    {bookData.description && (
                        <View className="mb-6">
                            <Text className="text-lg font-lora text-text-dark mb-3">
                                Descripción
                            </Text>
                            <Text className="font-montserrat text-text-light leading-6">
                                {bookData.description}
                            </Text>
                        </View>
                    )}

                    {/* Espacio al final */}
                    <View className="h-8" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default BookDetails;

