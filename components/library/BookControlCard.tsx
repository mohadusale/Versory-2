import StarRating from '@/components/common/StarRating';
import { useBookMutations } from '@/hooks/useBookMutations';
import { BookStatus, UserBook } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface BookControlCardProps {
    book: UserBook;
}

const BookControlCard: React.FC<BookControlCardProps> = ({ book }) => {
    // Recuperamos las funciones del hook (asegúrate de que tu hook acepte o ignore el ID si ya lo usas así)
    const { addOrUpdateBook, updateProgress, rateBook } = useBookMutations(book.id.toString());

    // Estado local para inputs (evita lag en la UI mientras escribes)
    const [pagesInput, setPagesInput] = useState(book.pages_read?.toString() || '0');
    
    // NUEVO: Estado visual de la pestaña seleccionada 
    // (permite estar en "Terminado" visualmente antes de guardar en el backend)
    const [selectedTab, setSelectedTab] = useState<BookStatus>(book.status);

    // Sincronizar si el libro cambia externamente (ej. al recargar)
    useEffect(() => {
        setPagesInput(book.pages_read?.toString() || '0');
        setSelectedTab(book.status);
    }, [book.pages_read, book.status]);

    // --- MANEJADORES ---

    const handleTabPress = useCallback((newStatus: BookStatus) => {
        setSelectedTab(newStatus); // Cambio visual inmediato

        if (newStatus === 'FN') {
            // CASO ESPECIAL: Si vamos a "Terminado", NO guardamos todavía.
            // Esperamos a que el usuario ponga la nota.
            return;
        }

        // Para "Por Leer" y "Leyendo", guardamos inmediatamente si hubo cambio
        if (newStatus !== book.status) {
            addOrUpdateBook({ isbn: book.book.isbn, status: newStatus });
        }
    }, [book.status, book.book.isbn, addOrUpdateBook]);

    const handlePageSubmit = useCallback(() => {
        const pages = parseInt(pagesInput);
        if (!isNaN(pages) && pages !== book.pages_read) {
            // Validar que no exceda el total
            const finalPages = Math.min(pages, book.book.pages_count);
            setPagesInput(finalPages.toString());
            updateProgress({ id: book.id, pages: finalPages });
        }
    }, [pagesInput, book.pages_read, book.book.pages_count, book.id, updateProgress]);

    const handleRating = useCallback((rating: number) => {
        if (selectedTab === 'FN') {
            // Si estamos en la pestaña de Terminado, al votar enviamos TODO junto:
            // 1. Cambio de estado a FN
            // 2. El rating
            addOrUpdateBook({ 
                isbn: book.book.isbn, 
                status: 'FN', 
                data: { rating } 
            });
        } else {
            // Si ya estaba terminado y solo editamos la nota
            rateBook({ id: book.id, rating });
        }
    }, [book.id, book.book.isbn, selectedTab, addOrUpdateBook, rateBook]);

    // Memorizar los botones de estado
    const statusButtons = useMemo(() => {
        const statuses: BookStatus[] = ['TR', 'RD', 'FN'];
        
        return statuses.map((status) => {
            // Usamos 'selectedTab' para la UI, no 'book.status' directamente
            const isActive = selectedTab === status;
            
            let label = 'Por Leer';
            let icon: keyof typeof Ionicons.glyphMap = 'bookmark-outline';
            
            if (status === 'RD') { label = 'Leyendo'; icon = 'book-outline'; }
            if (status === 'FN') { label = 'Leído'; icon = 'checkmark-circle-outline'; }

            // Estilo híbrido: NativeWind para estructura, style en línea para lo dinámico (tu solución)
            return (
                <TouchableOpacity
                    key={status}
                    onPress={() => handleTabPress(status)}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-lg gap-2"
                    style={isActive ? { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : undefined}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={isActive ? icon.replace('-outline', '') as any : icon} 
                        size={18} 
                        color={isActive ? '#E0AFA0' : '#8A817C'} 
                    />
                    {isActive && (
                        <Text className="text-xs font-montserrat-bold text-text-dark">
                            {label}
                        </Text>
                    )}
                </TouchableOpacity>
            );
        });
    }, [selectedTab, handleTabPress]);

    // --- RENDERIZADO ---

    return (
        <View className="mx-6 mt-6 bg-white rounded-2xl p-4 shadow-sm border border-primary/20">
            
            {/* 1. Selector de Estado */}
            <View className="flex-row bg-background rounded-xl p-1 mb-4">
                {statusButtons}
            </View>

            {/* 2. Contenido Dinámico (Basado en selectedTab) */}
            
            {/* CASO: LEYENDO */}
            {selectedTab === 'RD' && (
                <View>
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-text-light font-montserrat text-xs">TU PROGRESO</Text>
                        <Text className="text-text-light font-montserrat text-xs">
                            {Math.round(((book.pages_read || 0) / book.book.pages_count) * 100)}%
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                        {/* Barra Visual */}
                        <View className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                            <View 
                                className="h-full bg-accent rounded-full"
                                style={{ width: `${((book.pages_read || 0) / book.book.pages_count) * 100}%` }}
                            />
                        </View>

                        {/* Input Numérico */}
                        <View className="bg-background border border-primary/30 rounded-lg px-3 py-1 min-w-[80px] flex-row items-center">
                            <TextInput 
                                value={pagesInput}
                                onChangeText={setPagesInput}
                                onEndEditing={handlePageSubmit}
                                keyboardType="number-pad"
                                className="font-montserrat-medium text-text-dark text-right flex-1"
                                maxLength={5}
                            />
                            <Text className="text-text-light text-xs ml-1">pág</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* CASO: TERMINADO */}
            {selectedTab === 'FN' && (
                <View className="items-center py-2">
                    {/* Mensaje guía si aún no está guardado en el backend como FN */}
                    {book.status !== 'FN' ? (
                        <Text className="text-accent font-montserrat-bold text-xs mb-2">
                            ¡Valora el libro para terminar!
                        </Text>
                    ) : (
                        <Text className="text-text-light font-montserrat text-xs mb-2">
                            TU VALORACIÓN
                        </Text>
                    )}
                    
                    <StarRating 
                        rating={book.rating || 0} 
                        onRate={handleRating}
                        size={36}
                    />
                </View>
            )}

            {/* CASO: POR LEER */}
            {selectedTab === 'TR' && (
                <View className="items-center py-2">
                    <Text className="text-text-light font-montserrat-medium text-sm italic text-center">
                        "Un lector vive mil vidas antes de morir..."
                    </Text>
                </View>
            )}
        </View>
    );
};

export default BookControlCard;