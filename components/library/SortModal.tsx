/**
 * Modal para ordenar libros en la biblioteca
 */

import { SORT_OPTIONS_DISPLAY, SortOption } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

interface SortModalProps {
    visible: boolean;
    onClose: () => void;
    currentSort: SortOption;
    onSelectSort: (sort: SortOption) => void;
    /** Si es true, muestra opciones de valoración (solo para libros finalizados) */
    showRatingSort?: boolean;
}

const SortModal: React.FC<SortModalProps> = ({
    visible,
    onClose,
    currentSort,
    onSelectSort,
    showRatingSort = false,
}) => {
    const handleSelect = (sort: SortOption) => {
        onSelectSort(sort);
        onClose();
    };

    // Agrupar opciones de ordenación por categoría
    const allSortGroups = [
        {
            title: 'Título',
            options: ['title_asc', 'title_desc'] as SortOption[],
        },
        {
            title: 'Autor',
            options: ['author_asc', 'author_desc'] as SortOption[],
        },
        {
            title: 'Fecha añadido',
            options: ['date_added_desc', 'date_added_asc'] as SortOption[],
        },
        {
            title: 'Valoración',
            options: ['rating_desc', 'rating_asc'] as SortOption[],
            showOnlyForFinished: true, // Solo mostrar para libros finalizados
        },
        {
            title: 'Páginas',
            options: ['pages_asc', 'pages_desc'] as SortOption[],
        },
    ];

    // Filtrar grupos según el contexto
    const sortGroups = allSortGroups.filter(group => {
        if (group.showOnlyForFinished) {
            return showRatingSort;
        }
        return true;
    });

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            backdropOpacity={0.5}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={400}
            animationOutTiming={700}
            backdropTransitionInTiming={400}
            backdropTransitionOutTiming={700}
            style={{ margin: 0, justifyContent: 'flex-end' }}
            avoidKeyboard={true}
            useNativeDriver={true}
            useNativeDriverForBackdrop={true}
            propagateSwipe={true}
        >
            <View 
                className="bg-background rounded-t-3xl"
                style={{ maxHeight: '70%' }}
            >
                {/* Handle para swipe */}
                <View className='w-10 h-1.5 bg-gray-300 rounded-full self-center my-3'/>
                
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 pb-3 border-b border-primary/30">
                    <Text className="text-xl font-lora text-text-dark">Ordenar por</Text>
                    <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
                        <Ionicons name="close" size={24} color="#463F3A" />
                    </TouchableOpacity>
                </View>

                {/* Opciones de ordenación con Scroll */}
                <ScrollView 
                    className="px-4"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
                >
                    {sortGroups.map((group, groupIndex) => (
                        <View key={group.title}>
                            {/* Título del grupo */}
                            <Text className="text-sm font-montserrat-medium text-text-light mt-4 mb-2">
                                {group.title}
                            </Text>
                            
                            {/* Opciones del grupo */}
                            {group.options.map((option) => {
                                const isSelected = currentSort === option;
                                
                                return (
                                    <TouchableOpacity
                                        key={option}
                                        onPress={() => handleSelect(option)}
                                        activeOpacity={0.7}
                                        className={`flex-row items-center justify-between py-3.5 px-3 rounded-lg mb-1 ${
                                            isSelected ? 'bg-accent/10' : ''
                                        }`}
                                    >
                                        <Text 
                                            className={`font-montserrat ${
                                                isSelected 
                                                    ? 'text-accent font-montserrat-medium' 
                                                    : 'text-text-dark'
                                            }`}
                                        >
                                            {SORT_OPTIONS_DISPLAY[option]}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons 
                                                name="checkmark-circle" 
                                                size={22} 
                                                color="#E0AFA0"
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                            
                            {/* Separador entre grupos (excepto el último) */}
                            {groupIndex < sortGroups.length - 1 && (
                                <View className="h-px bg-primary/20 my-2" />
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );
};

export default SortModal;

