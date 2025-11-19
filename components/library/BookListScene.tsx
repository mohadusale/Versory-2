import SearchBar from '@/components/common/SearchBar';
import { Author, Genre, SortOption, UserBook } from '@/types/types';
import { sortBooks } from '@/utils/sortUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Keyboard, RefreshControl, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BookGridItem from './BookGridItem';
import FilterModal, { FilterSectionConfig } from './FilterModal';
import SortModal from './SortModal';

interface BookListSceneProps {
    books: UserBook[];
    isLoading: boolean;
    onRefresh: () => void;
    listKey: string; // Clave única para la lista (ej: 'reading', 'toRead', 'finished')
    showRatingSort?: boolean; // Si es true, muestra opciones de ordenación por valoración
}

const BookListScene: React.FC<BookListSceneProps> = ({ books, isLoading, onRefresh, listKey, showRatingSort = false }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('date_added_desc');
    const [filters, setFilters] = useState<Record<string, any>>({
        genres: [],
        authors: [],
        year: null,
    });

    // Extraer géneros, autores y años únicos de los libros
    const { availableGenres, availableAuthors, availableYears } = useMemo(() => {
        const genresMap = new Map<number, Genre>();
        const authorsMap = new Map<number, Author>();
        const yearsSet = new Set<number>();

        books.forEach(userBook => {
            // Géneros
            userBook.book.genres.forEach(genre => {
                if (!genresMap.has(genre.id)) {
                    genresMap.set(genre.id, genre);
                }
            });

            // Autores
            userBook.book.authors.forEach(author => {
                if (!authorsMap.has(author.id)) {
                    authorsMap.set(author.id, author);
                }
            });

            // Años
            if (userBook.book.published_date) {
                const year = new Date(userBook.book.published_date).getFullYear();
                if (!isNaN(year)) {
                    yearsSet.add(year);
                }
            }
        });

        return {
            availableGenres: Array.from(genresMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
            availableAuthors: Array.from(authorsMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
            availableYears: Array.from(yearsSet).sort((a, b) => b - a), // Más reciente primero
        };
    }, [books]);

    // Filtrar y ordenar libros
    const filteredAndSortedBooks = useMemo(() => {
        let result = books;

        // Filtrar por búsqueda de título
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(book => 
                book.book.title.toLowerCase().includes(lowerQuery)
            );
        }

        // Filtrar por géneros
        if (filters.genres?.length > 0) {
            result = result.filter(book =>
                book.book.genres.some(genre => 
                    filters.genres.includes(genre.name)
                )
            );
        }

        // Filtrar por autores
        if (filters.authors?.length > 0) {
            result = result.filter(book =>
                book.book.authors.some(author => 
                    filters.authors.includes(author.name)
                )
            );
        }

        // Filtrar por año
        if (filters.year) {
            result = result.filter(book => {
                if (!book.book.published_date) return false;
                const year = new Date(book.book.published_date).getFullYear();
                return year === filters.year;
            });
        }

        // Aplicar ordenación
        return sortBooks(result, sortOption);
    }, [books, searchQuery, filters, sortOption]);

    // Contar filtros activos
    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).reduce((count, value) => {
            if (Array.isArray(value) && value.length > 0) {
                return count + value.length;
            }
            if (value !== null && !Array.isArray(value)) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [filters]);

    // Prop de configuración para el modal genérico
    const sectionsConfig = useMemo((): FilterSectionConfig[] => {
        return [
            // Año
            {
                id: 'year',
                title: 'Año de publicación',
                type: 'single-horizontal',
                data: [null, ...availableYears],
            },
            {
                id: 'genres',
                title: 'Géneros',
                type: 'multi-list',
                data: availableGenres,
                searchable: true,
                placeholder: 'Buscar género...',
                getKey: (genre: Genre) => genre.id.toString(),
                getLabel: (genre: Genre) => genre.name,
                getValue: (genre: Genre) => genre.name,
            },
            {
                id: 'authors',
                title: 'Autores',
                type: 'multi-list',
                data: availableAuthors,
                searchable: true,
                placeholder: 'Buscar autor...',
                getKey: (author: Author) => author.id.toString(),
                getLabel: (author: Author) => author.name,
                getValue: (author: Author) => author.name,
            }
        ];
    }, [availableGenres, availableAuthors, availableYears]);

    // Si no hay libros en esta sección, mostrar un mensaje
    if (books.length === 0) {
        return (
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#FF7B54" />
                }
                keyboardShouldPersistTaps="handled"
            >
                <Text className="font-montserrat text-text-light">No hay libros en esta estantería.</Text>
            </ScrollView>
        );
    }

    // Si hay libros, mostrar buscador y lista
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
                <View className="flex-row items-center justify-between px-4 pt-3 pb-3">
                    <SearchBar 
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Buscar..."
                    />
                    {/* Iconos de filtro y ordenación */}
                    <View className="flex-row items-center gap-4">
                        {/* Icono de Filtro con Badge */}
                        <View className="relative">
                            <TouchableOpacity 
                                activeOpacity={0.6}
                                onPress={() => setShowFilterModal(true)}
                            >
                                <Ionicons 
                                    name={activeFiltersCount > 0 ? "funnel" : "funnel-outline"} 
                                    size={22} 
                                    color={activeFiltersCount > 0 ? "#E0AFA0" : "#8A817C"} 
                                />
                            </TouchableOpacity>
                            {activeFiltersCount > 0 && (
                                <View className="absolute -top-1 -right-1 bg-accent rounded-full w-4 h-4 items-center justify-center">
                                    <Text className="text-white text-[10px] font-montserrat-bold">
                                        {activeFiltersCount}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Icono de Ordenación */}
                        <TouchableOpacity 
                            activeOpacity={0.6}
                            onPress={() => setShowSortModal(true)}
                        >
                            <Ionicons name="swap-vertical-outline" size={22} color="#8A817C" />
                        </TouchableOpacity>
                    </View>
                </View>
                {filteredAndSortedBooks.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="font-montserrat text-text-light">
                            No se encontraron libros con esos filtros
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        key={listKey} 
                        data={filteredAndSortedBooks}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <BookGridItem item={item} />}
                        numColumns={4}
                        contentContainerStyle={{ 
                            paddingBottom: 20,
                            paddingTop: 8,
                            paddingHorizontal: 4
                        }}
                        keyboardShouldPersistTaps="handled"
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoading}
                                onRefresh={onRefresh}
                                tintColor="#FF7B54"
                            />
                        }
                    />
                )}

                {/* Modal de Filtros */}
                <FilterModal
                    visible={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
                    filters={filters}
                    onApplyFilters={setFilters}
                    sectionsConfig={sectionsConfig}
                />

                {/* Modal de Ordenación */}
                <SortModal
                    visible={showSortModal}
                    onClose={() => setShowSortModal(false)}
                    currentSort={sortOption}
                    onSelectSort={setSortOption}
                    showRatingSort={showRatingSort}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default BookListScene;

