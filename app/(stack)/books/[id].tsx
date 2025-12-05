/**
 * Pantalla de detalles de un libro
 */

import DatePickerModal from '@/components/common/DatePickerModal';
import BookControlCard from '@/components/library/BookControlCard';
import AddBookModal from '@/components/library/AddBookModal';
import StatusChangeModal from '@/components/library/StatusChangeModal';
import { useBookDetails } from '@/hooks/useBookDetails';
import { useBookMutations } from '@/hooks/useBookMutations';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/lib/axios';
import { Book, BookStatus } from '@/types/types';
import { apiAddOrUpdateBook } from '@/lib/api';

const BookDetails = () => {
    const params = useLocalSearchParams<{ id: string; preview?: string }>();
    const { id, preview } = params;
    const isPreviewMode = preview === 'true';
    
    const navigation = useNavigation();
    
    // Estado para modo preview (libro sin añadir a biblioteca)
    const [previewBook, setPreviewBook] = useState<Book | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
    
    // Modales para añadir libro
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<BookStatus>('TR');
    
    // Hook normal para libros ya en biblioteca
    const { book, isLoading, error, refresh } = useBookDetails(isPreviewMode ? '' : id || '');
    const { deleteBook, updateDates } = useBookMutations(id || '');
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerType, setDatePickerType] = useState<'start' | 'finish'>('start');
    const [editingDate, setEditingDate] = useState<Date>(new Date());
    
    // Estado para controlar los desplegables
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isGenresExpanded, setIsGenresExpanded] = useState(false);

    // Cargar datos del libro en modo preview
    useEffect(() => {
        if (isPreviewMode && id) {
            loadPreviewBook(id);
        }
    }, [isPreviewMode, id]);

    const loadPreviewBook = async (isbn: string) => {
        setPreviewLoading(true);
        setPreviewError(null);
        try {
            // Buscar el libro por ISBN en la tabla de Books
            const response = await api.get<Book[]>('/books/', {
                params: { search: isbn }
            });
            
            if (response.data && response.data.length > 0) {
                const foundBook = response.data.find(b => b.isbn === isbn);
                if (foundBook) {
                    setPreviewBook(foundBook);
                } else {
                    setPreviewError('Libro no encontrado');
                }
            } else {
                setPreviewError('Libro no encontrado');
            }
        } catch (err: any) {
            setPreviewError(err.message || 'Error al cargar el libro');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleStatusSelected = (status: BookStatus) => {
        setSelectedStatus(status);
        setShowStatusModal(true);
    };

    const handleStatusConfirm = async (data: { 
        status: BookStatus; 
        start_date?: string; 
        finished_date?: string; 
        rating?: number; 
        pages_read?: number 
    }) => {
        if (!previewBook) return;
        
        setIsAddingToLibrary(true);
        setShowStatusModal(false);
        
        try {
            const userBook = await apiAddOrUpdateBook(previewBook.isbn, data.status, {
                start_date: data.start_date,
                finished_date: data.finished_date,
                rating: data.rating,
                pages_read: data.pages_read,
            });
            
            // Navegar directamente al libro añadido en modo normal (sin preview)
            router.replace(`/(stack)/books/${userBook.id}`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo añadir el libro a tu biblioteca');
            setIsAddingToLibrary(false);
        }
    }; 

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
                            handleBack();
                        }
                    }
                }
            ]
        );
    };

    const handleEditDate = (type: 'start' | 'finish', currentDate?: string | null) => {
        if (!currentDate) return;
        
        setDatePickerType(type);
        setEditingDate(new Date(currentDate));
        setShowDatePicker(true);
    };

    const handleDateConfirm = async (newDate: Date) => {
        if (!book) return;
        
        const dateString = newDate.toISOString().split('T')[0];
        
        try {
            if (datePickerType === 'start') {
                // Validar que start_date < finished_date
                if (book.finished_date && dateString > book.finished_date) {
                    Alert.alert('Error', 'La fecha de inicio no puede ser posterior a la fecha de finalización');
                    return;
                }
                await updateDates({ id: book.id, start_date: dateString });
            } else {
                // Validar que finished_date > start_date
                if (book.start_date && dateString < book.start_date) {
                    Alert.alert('Error', 'La fecha de finalización no puede ser anterior a la fecha de inicio');
                    return;
                }
                await updateDates({ id: book.id, finished_date: dateString });
            }
            setShowDatePicker(false);
        } catch (error) {
        }
    };

    // Estado de carga
    const loading = isPreviewMode ? previewLoading : isLoading;
    if (loading) {
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
    const hasError = isPreviewMode ? previewError : error;
    const hasData = isPreviewMode ? previewBook : book;
    
    if (hasError || !hasData) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 justify-center items-center p-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#E0AFA0" />
                    <Text className="text-text-dark font-lora text-xl text-center mt-4">
                        No se pudo cargar el libro
                    </Text>
                    <Text className="text-text-light font-montserrat text-center mt-2 mb-6">
                        {(isPreviewMode ? previewError : error?.message) || 'El libro no fue encontrado'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleBack}
                        className="bg-primary/30 py-3 px-6 rounded-xl"
                    >
                        <Text className="text-text-dark font-montserrat-medium">
                            Volver
                        </Text>
                    </TouchableOpacity>
                    {!isPreviewMode && (
                        <TouchableOpacity
                            onPress={() => refresh()}
                            className="mt-4"
                        >
                            <Text className="text-accent font-montserrat-medium">
                                Reintentar conexión
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    // Extraer datos según el modo
    let bookData: Book;
    let start_date: string | null = null;
    let finished_date: string | null = null;
    
    if (isPreviewMode && previewBook) {
        bookData = previewBook;
    } else if (book) {
        bookData = book.book;
        start_date = book.start_date;
        finished_date = book.finished_date;
    } else {
        return null;
    }

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
                    {isPreviewMode ? 'Vista Previa' : 'Detalles'}
                </Text>

                {!isPreviewMode && (
                    <TouchableOpacity
                        onPress={handleDelete}
                        className="p-2"
                        activeOpacity={0.6}
                    >
                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                    </TouchableOpacity>
                )}
                
                {isPreviewMode && <View className="w-10" />}
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

                {/* --- TARJETA DE CONTROL o BOTÓN PARA AÑADIR --- */}
                {isPreviewMode ? (
                    // Modo Preview: Botón para añadir a biblioteca
                    <View className="px-6">
                        <TouchableOpacity
                            className="bg-accent py-4 rounded-xl flex-row items-center justify-center shadow-md"
                            onPress={() => setShowAddBookModal(true)}
                            disabled={isAddingToLibrary}
                            activeOpacity={0.8}
                        >
                            {isAddingToLibrary ? (
                                <ActivityIndicator color="#F8F4F1" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="add-circle-outline" size={24} color="#F8F4F1" />
                                    <Text className="font-montserratSemiBold text-lg text-background-light ml-3">
                                        Añadir a mi biblioteca
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Modo Normal: Tarjeta de control
                    <BookControlCard book={book!} />
                )}
                
                {/* Información adicional */}
                <View className="px-6 py-8">
                    {/* Grid de metadatos - 2x2 */}
                    <View className="mb-3 gap-3">
                        {/* Fila 1 */}
                        <View className="flex-row gap-3">
                            {/* Páginas */}
                            {bookData.pages_count && bookData.pages_count > 0 ? (
                                <View className="flex-1 bg-primary/10 px-4 py-3 rounded-xl flex-row items-center gap-2">
                                    <Ionicons name="layers-outline" size={18} color="#463F3A" />
                                    <Text className="font-montserratMedium text-sm text-text-dark">
                                        {bookData.pages_count} pág.
                                    </Text>
                                </View>
                            ) : (
                                <View className="flex-1" />
                            )}

                            {/* Año */}
                            {bookData.published_date ? (
                                <View className="flex-1 bg-primary/10 px-4 py-3 rounded-xl flex-row items-center gap-2">
                                    <Ionicons name="calendar-outline" size={18} color="#463F3A" />
                                    <Text className="font-montserratMedium text-sm text-text-dark">
                                        {new Date(bookData.published_date).getFullYear()}
                                    </Text>
                                </View>
                            ) : (
                                <View className="flex-1" />
                            )}
                        </View>

                        {/* Fila 2 */}
                        <View className="flex-row gap-3">
                            {/* Editorial */}
                            {bookData.publisher ? (
                                <View className="flex-1 bg-primary/10 px-4 py-3 rounded-xl flex-row items-center gap-2">
                                    <Ionicons name="business-outline" size={18} color="#463F3A" />
                                    <Text className="font-montserratMedium text-sm text-text-dark" numberOfLines={1}>
                                        {bookData.publisher}
                                    </Text>
                                </View>
                            ) : (
                                <View className="flex-1" />
                            )}

                            {/* Idioma */}
                            {bookData.language ? (
                                <View className="flex-1 bg-primary/10 px-4 py-3 rounded-xl flex-row items-center gap-2">
                                    <Ionicons name="language-outline" size={18} color="#463F3A" />
                                    <Text className="font-montserratMedium text-sm text-text-dark uppercase">
                                        {bookData.language}
                                    </Text>
                                </View>
                            ) : (
                                <View className="flex-1" />
                            )}
                        </View>
                    </View>

                    {/* ISBN - Recuadro largo */}
                    {bookData.isbn && (
                        <View className="mb-8 bg-primary/10 px-4 py-3 rounded-xl flex-row items-center gap-2">
                            <Ionicons name="barcode-outline" size={18} color="#463F3A" />
                            <Text className="font-montserratMedium text-sm text-text-dark">
                                ISBN: {bookData.isbn}
                            </Text>
                        </View>
                    )}

                    {/* Historial de Fechas */}
                    {(start_date || finished_date) && (
                        <View className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-primary/10">
                            <Text className="text-sm font-lora text-text-dark mb-3 border-b border-primary/10 pb-2">
                                Historial
                            </Text>
                            {start_date && (
                                <TouchableOpacity 
                                    className="flex-row items-center justify-between mb-2 py-1"
                                    onPress={() => handleEditDate('start', start_date)}
                                    activeOpacity={0.6}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <Ionicons name="play-circle" size={18} color="#E0AFA0" />
                                        <Text className="font-montserrat text-text-light ml-2 text-sm">
                                            Empezado: <Text className="text-text-dark">{new Date(start_date).toLocaleDateString()}</Text>
                                        </Text>
                                    </View>
                                    <Ionicons name="create-outline" size={18} color="#8A817C" />
                                </TouchableOpacity>
                            )}
                            {finished_date && (
                                <TouchableOpacity 
                                    className="flex-row items-center justify-between py-1"
                                    onPress={() => handleEditDate('finish', finished_date)}
                                    activeOpacity={0.6}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <Ionicons name="checkmark-circle" size={18} color="#E0AFA0" />
                                        <Text className="font-montserrat text-text-light ml-2 text-sm">
                                            Terminado: <Text className="text-text-dark">{new Date(finished_date).toLocaleDateString()}</Text>
                                        </Text>
                                    </View>
                                    <Ionicons name="create-outline" size={18} color="#8A817C" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Géneros (Desplegable) */}
                    {bookData.genres && bookData.genres.length > 0 && (
                        <View className="mb-4 bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
                            <TouchableOpacity
                                className="flex-row items-center justify-between p-4"
                                onPress={() => setIsGenresExpanded(!isGenresExpanded)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center flex-1">
                                    <Ionicons 
                                        name="pricetags-outline" 
                                        size={20} 
                                        color="#E0AFA0" 
                                    />
                                    <Text className="text-base font-lora text-text-dark ml-3">
                                        Géneros ({bookData.genres.length})
                                    </Text>
                                </View>
                                <Ionicons 
                                    name={isGenresExpanded ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color="#8A817C" 
                                />
                            </TouchableOpacity>
                            
                            {isGenresExpanded && (
                                <View className="px-4 pb-4 border-t border-primary/10 pt-3">
                                    <View className="flex-row flex-wrap gap-2">
                                        {bookData.genres.map((genre, index) => (
                                            <View 
                                                key={index} 
                                                className="bg-accent/20 px-3 py-2 rounded-full flex-row items-center gap-2"
                                            >
                                                <Ionicons name="pricetag" size={14} color="#E0AFA0" />
                                                <Text className="font-montserratMedium text-sm text-text-dark">
                                                    {genre.name}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Sinopsis (Desplegable) */}
                    {bookData.description && (
                        <View className="mb-6 bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
                            <TouchableOpacity
                                className="flex-row items-center justify-between p-4"
                                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center flex-1">
                                    <Ionicons 
                                        name="document-text-outline" 
                                        size={20} 
                                        color="#E0AFA0" 
                                    />
                                    <Text className="text-base font-lora text-text-dark ml-3">
                                        Sinopsis
                                    </Text>
                                </View>
                                <Ionicons 
                                    name={isDescriptionExpanded ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color="#8A817C" 
                                />
                            </TouchableOpacity>
                            
                            {isDescriptionExpanded && (
                                <View className="px-4 pb-4 border-t border-primary/10">
                                    <Text className="font-montserrat text-text-light leading-6 text-sm text-justify pt-3">
                                        {bookData.description}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    <View className="h-12" />
                </View>
            </ScrollView>

            {/* DatePicker Modal */}
            <DatePickerModal
                visible={showDatePicker}
                title={datePickerType === 'start' ? 'Fecha de inicio' : 'Fecha de finalización'}
                date={editingDate}
                maximumDate={new Date()}
                onConfirm={handleDateConfirm}
                onCancel={() => setShowDatePicker(false)}
            />

            {/* Modal para seleccionar estado (solo en modo preview) */}
            {isPreviewMode && previewBook && (
                <>
                    <AddBookModal
                        visible={showAddBookModal}
                        book={previewBook}
                        onClose={() => setShowAddBookModal(false)}
                        onStatusSelect={handleStatusSelected}
                    />
                    
                    <StatusChangeModal
                        visible={showStatusModal}
                        targetStatus={selectedStatus}
                        currentStartDate={null}
                        bookPagesCount={previewBook.pages_count || 0}
                        onConfirm={handleStatusConfirm}
                        onCancel={() => setShowStatusModal(false)}
                    />
                </>
            )}
        </SafeAreaView>
    );
};

export default BookDetails;