/**
 * Pantalla de detalles de un libro
 */

import BookControlCard from '@/components/library/BookControlCard';
import { useBookDetails } from '@/hooks/useBookDetails';
import { useBookMutations } from '@/hooks/useBookMutations';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // Importamos useNavigation
import React from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation(); // Usamos el objeto de navegación nativo
    const { book, isLoading, error, refresh } = useBookDetails(id || '');
    const { deleteBook } = useBookMutations(id || ''); 

    // Función para volver atrás de forma segura
    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Eliminar libro",
            "¿Estás seguro de que quieres eliminar este libro de tu biblioteca?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive", 
                    onPress: async () => {
                        if (book) {
                            await deleteBook(book.id);
                            handleBack(); // Usamos la función segura
                        }
                    }
                }
            ]
        );
    };

    // Estado de carga
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#E0AFA0" />
                    <Text className="text-text-light font-montserrat mt-4">
                        Cargando...
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
                    <Text className="text-text-light font-montserrat text-center mt-2 mb-6">
                        {error?.message || 'El libro no fue encontrado'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleBack}
                        className="bg-primary/30 py-3 px-6 rounded-xl"
                    >
                        <Text className="text-text-dark font-montserrat-medium">
                            Volver a la biblioteca
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => refresh()}
                        className="mt-4"
                    >
                        <Text className="text-accent font-montserrat-medium">
                            Reintentar conexión
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const { book: bookData, start_date, finished_date } = book;

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-primary/20">
                <TouchableOpacity
                    onPress={handleBack}
                    className="p-2"
                    activeOpacity={0.6}
                >
                    <Ionicons name="arrow-back" size={24} color="#463F3A" />
                </TouchableOpacity>
                
                <Text className="text-lg font-lora text-text-dark flex-1 text-center mx-4" numberOfLines={1}>
                    Detalles
                </Text>

                <TouchableOpacity
                    onPress={handleDelete}
                    className="p-2"
                    activeOpacity={0.6}
                >
                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Portada y título */}
                <View className="items-center pt-8 pb-4 px-6">
                    <Image
                        source={{
                            uri: bookData.cover_url || 'https://placehold.co/300x450/292524/6B6664?text=Sin+Portada',
                        }}
                        style={{ width: 160, height: 240 }}
                        className="rounded-lg shadow-xl bg-primary/20"
                        contentFit="cover"
                        transition={200}
                    />
                    
                    <Text className="text-2xl font-lora text-text-dark text-center mt-6 px-4 leading-8">
                        {bookData.title}
                    </Text>

                    {bookData.authors.length > 0 && (
                        <Text className="text-base font-montserrat text-text-light text-center mt-2">
                            {bookData.authors.map(a => a.name).join(', ')}
                        </Text>
                    )}
                </View>

                {/* --- TARJETA DE CONTROL (Estado, Progreso, Rating) --- */}
                <BookControlCard book={book} />
                
                {/* Información adicional */}
                <View className="px-6 py-8">
                    {/* Grid de metadatos */}
                    <View className="flex-row flex-wrap gap-3 mb-8">
                        <View className="bg-primary/10 px-4 py-2 rounded-full flex-row items-center gap-2">
                            <Ionicons name="layers-outline" size={16} color="#463F3A" />
                            <Text className="font-montserrat text-xs text-text-dark">
                                {bookData.pages_count} pág.
                            </Text>
                        </View>

                        {bookData.published_date && (
                            <View className="bg-primary/10 px-4 py-2 rounded-full flex-row items-center gap-2">
                                <Ionicons name="calendar-outline" size={16} color="#463F3A" />
                                <Text className="font-montserrat text-xs text-text-dark">
                                    {new Date(bookData.published_date).getFullYear()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Historial de Fechas */}
                    {(start_date || finished_date) && (
                        <View className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-primary/10">
                            <Text className="text-sm font-lora text-text-dark mb-3 border-b border-primary/10 pb-2">
                                Historial
                            </Text>
                            {start_date && (
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="play-circle" size={18} color="#E0AFA0" />
                                    <Text className="font-montserrat text-text-light ml-2 text-sm">
                                        Empezado: <Text className="text-text-dark">{new Date(start_date).toLocaleDateString()}</Text>
                                    </Text>
                                </View>
                            )}
                            {finished_date && (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={18} color="#E0AFA0" />
                                    <Text className="font-montserrat text-text-light ml-2 text-sm">
                                        Terminado: <Text className="text-text-dark">{new Date(finished_date).toLocaleDateString()}</Text>
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Sinopsis */}
                    {bookData.description && (
                        <View className="mb-6">
                            <Text className="text-lg font-lora text-text-dark mb-3">
                                Sinopsis
                            </Text>
                            <Text className="font-montserrat text-text-light leading-6 text-sm text-justify">
                                {bookData.description}
                            </Text>
                        </View>
                    )}

                    <View className="h-12" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default BookDetails;