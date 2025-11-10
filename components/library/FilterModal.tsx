import SearchBar from '@/components/common/SearchBar';
import { Author, Genre } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export interface FilterOptions {
    selectedGenres: string[];
    selectedAuthors: string[];
    selectedYear: number | null;
}

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: FilterOptions;
    onApplyFilters: (filters: FilterOptions) => void;
    availableGenres: Genre[];
    availableAuthors: Author[];
    availableYears: number[];
}

const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    onClose,
    filters,
    onApplyFilters,
    availableGenres,
    availableAuthors,
    availableYears,
}) => {
    const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
    const [genreSearch, setGenreSearch] = useState('');
    const [authorSearch, setAuthorSearch] = useState('');

    // Filtrar géneros según búsqueda
    const filteredGenres = useMemo(() => {
        if (!genreSearch.trim()) return availableGenres;
        const lowerQuery = genreSearch.toLowerCase();
        return availableGenres.filter(genre =>
            genre.name.toLowerCase().includes(lowerQuery)
        );
    }, [availableGenres, genreSearch]);

    // Filtrar autores según búsqueda
    const filteredAuthors = useMemo(() => {
        if (!authorSearch.trim()) return availableAuthors;
        const lowerQuery = authorSearch.toLowerCase();
        return availableAuthors.filter(author =>
            author.name.toLowerCase().includes(lowerQuery)
        );
    }, [availableAuthors, authorSearch]);

    const handleGenreToggle = (genreName: string) => {
        setLocalFilters(prev => ({
            ...prev,
            selectedGenres: prev.selectedGenres.includes(genreName)
                ? prev.selectedGenres.filter(g => g !== genreName)
                : [...prev.selectedGenres, genreName]
        }));
    };

    const handleAuthorToggle = (authorName: string) => {
        setLocalFilters(prev => ({
            ...prev,
            selectedAuthors: prev.selectedAuthors.includes(authorName)
                ? prev.selectedAuthors.filter(a => a !== authorName)
                : [...prev.selectedAuthors, authorName]
        }));
    };

    const handleYearSelect = (year: number | null) => {
        setLocalFilters(prev => ({
            ...prev,
            selectedYear: prev.selectedYear === year ? null : year
        }));
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleClearAll = () => {
        const emptyFilters: FilterOptions = {
            selectedGenres: [],
            selectedAuthors: [],
            selectedYear: null,
        };
        setLocalFilters(emptyFilters);
    };

    const activeFiltersCount = 
        localFilters.selectedGenres.length + 
        localFilters.selectedAuthors.length + 
        (localFilters.selectedYear ? 1 : 0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <Pressable 
                    className="flex-1 justify-end bg-black/50"
                    onPress={onClose}
                >
                    <Pressable 
                        className="bg-background rounded-t-3xl"
                        style={{ maxHeight: '85%', minHeight: '60%' }}
                        onPress={(e: any) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between p-4 border-b border-primary/30">
                            <Text className="text-xl font-lora text-text-dark">Filtros</Text>
                            <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
                                <Ionicons name="close" size={24} color="#463F3A" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            className="p-4"
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                        {/* Sección de Año */}
                        <View className="mb-6">
                            <Text className="text-base font-montserrat-medium text-text-dark mb-3">
                                Año de Publicación
                            </Text>
                            <FlatList
                                data={[null, ...availableYears]} // Ponemos 'null' primero para "Todos"
                                keyExtractor={(item) => (item === null ? 'all-years' : item.toString())}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item: year }) => {
                                    const isSelected = localFilters.selectedYear === year;
                                    const label = year === null ? 'Todos' : year.toString();
                        
                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleYearSelect(year)}
                                            activeOpacity={0.7}
                                            // Aplicamos estilos dinámicos con Tailwind
                                            className={`
                                                py-2 px-4 rounded-full mr-2 border
                                                ${isSelected
                                                    ? 'bg-accent border-accent'
                                                    : 'bg-background border-primary/40'
                                                }
                                            `}
                                        >
                                            <Text className={`
                                                font-montserrat-medium
                                                ${isSelected
                                                    ? 'text-white'
                                                    : 'text-text-dark'
                                                }
                                            `}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                        {/* Sección de Géneros */}
                        <View className="mb-6">
                            <Text className="text-base font-montserrat-medium text-text-dark mb-3">
                                Géneros
                            </Text>
                            <SearchBar
                                value={genreSearch}
                                onChangeText={setGenreSearch}
                                placeholder="Buscar género..."
                            />
                            <View className="mt-3 max-h-48">
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {filteredGenres.map(genre => {
                                        const isSelected = localFilters.selectedGenres.includes(genre.name);
                                        return (
                                            <TouchableOpacity
                                                key={genre.id}
                                                onPress={() => handleGenreToggle(genre.name)}
                                                activeOpacity={0.7}
                                                className="flex-row items-center justify-between py-3 border-b border-primary/20"
                                            >
                                                <Text className={`font-montserrat ${
                                                    isSelected ? 'text-accent font-montserrat-medium' : 'text-text-dark'
                                                }`}>
                                                    {genre.name}
                                                </Text>
                                                {isSelected && (
                                                    <Ionicons name="checkmark-circle" size={22} color="#E0AFA0" />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Sección de Autores */}
                        <View className="mb-6">
                            <Text className="text-base font-montserrat-medium text-text-dark mb-3">
                                Autores
                            </Text>
                            <SearchBar
                                value={authorSearch}
                                onChangeText={setAuthorSearch}
                                placeholder="Buscar autor..."
                            />
                            <View className="mt-3 max-h-48">
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {filteredAuthors.map(author => {
                                        const isSelected = localFilters.selectedAuthors.includes(author.name);
                                        return (
                                            <TouchableOpacity
                                                key={author.id}
                                                onPress={() => handleAuthorToggle(author.name)}
                                                activeOpacity={0.7}
                                                className="flex-row items-center justify-between py-3 border-b border-primary/20"
                                            >
                                                <Text className={`font-montserrat ${
                                                    isSelected ? 'text-accent font-montserrat-medium' : 'text-text-dark'
                                                }`}>
                                                    {author.name}
                                                </Text>
                                                {isSelected && (
                                                    <Ionicons name="checkmark-circle" size={22} color="#E0AFA0" />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    </ScrollView>

                        {/* Footer con botones */}
                        <View className="p-4 border-t border-primary/30 flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleClearAll}
                                activeOpacity={0.7}
                                className="flex-1 py-3 rounded-xl border border-primary/40 items-center"
                            >
                                <Text className="font-montserrat-medium text-text-dark">
                                    Limpiar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleApply}
                                activeOpacity={0.7}
                                className="flex-1 py-3 rounded-xl bg-accent items-center"
                            >
                                <Text className="font-montserrat-medium text-white">
                                    Aplicar {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default FilterModal;

