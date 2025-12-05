import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { 
    ActivityIndicator, 
    FlatList, 
    Image, 
    Keyboard, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiSearchBook, apiSearchBooks, SearchBookResult } from '@/lib/api';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLibrary } from '@/hooks/useLibrary';
import BarcodeScanner from '@/components/common/BarcodeScanner';

const Explore = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchBookResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const handleError = useErrorHandler({ title: 'Error de Búsqueda' });
    
    // Obtener biblioteca del usuario para marcar libros que ya tiene
    const { readingBooks, toReadBooks, finishedBooks } = useLibrary();
    
    // Crear un Set de ISBNs de todos los libros en la biblioteca para búsqueda rápida
    const libraryISBNs = useMemo(() => {
        const allBooks = [...readingBooks, ...toReadBooks, ...finishedBooks];
        return new Set(allBooks.map(userBook => userBook.book.isbn));
    }, [readingBooks, toReadBooks, finishedBooks]);
    
    // Crear un Map para obtener rápidamente el ID del UserBook por ISBN
    const libraryBooksMap = useMemo(() => {
        const allBooks = [...readingBooks, ...toReadBooks, ...finishedBooks];
        const map = new Map();
        allBooks.forEach(userBook => {
            map.set(userBook.book.isbn, userBook.id);
        });
        return map;
    }, [readingBooks, toReadBooks, finishedBooks]);

    const handleSearch = async () => {
        if (searchQuery.trim().length < 1) {
            alert('Por favor, escribe algo para buscar');
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        Keyboard.dismiss();

        try {
            const results = await apiSearchBooks(searchQuery.trim());
            setSearchResults(results);
        } catch (error: any) {
            handleError(error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleBookPress = async (book: SearchBookResult) => {
        try {
            // Mostrar que está cargando
            setIsSearching(true);
            
            // Verificar si el libro ya está en la biblioteca del usuario
            const userBookId = libraryBooksMap.get(book.isbn);
            
            if (userBookId) {
                // Si ya está en la biblioteca, navegar directamente a la pantalla del libro
                router.push(`/(stack)/books/${userBookId}`);
                return;
            }
            
            // Si NO está en la biblioteca, asegurar que el libro existe en BD
            const result = await apiSearchBook(book.isbn);
            
            if (result.status === 'not_found') {
                alert('Libro no encontrado. Intenta con otro.');
                return;
            }
            
            // Navegar a la vista previa del libro (para agregarlo)
            router.push(`/(stack)/books/${book.isbn}?preview=true`);
        } catch (error: any) {
            handleError(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleScanPress = () => {
        setShowScanner(true);
    };

    const handleBarcodeScanned = async (isbn: string) => {
        setShowScanner(false);
        setIsSearching(true);
        
        try {
            const result = await apiSearchBook(isbn);
            
            if (result.status === 'not_found') {
                alert('Libro no encontrado. El ISBN escaneado no está disponible en nuestras fuentes.');
                return;
            }
            
            if (result.data) {
                // Verificar si el libro ya está en la biblioteca del usuario
                const userBookId = libraryBooksMap.get(result.data.isbn);
                
                if (userBookId) {
                    // Si ya está en la biblioteca, navegar directamente a la pantalla del libro
                    router.push(`/(stack)/books/${userBookId}`);
                } else {
                    // Si NO está en la biblioteca, navegar a la vista previa del libro (para agregarlo)
                    router.push(`/(stack)/books/${result.data.isbn}?preview=true`);
                }
            }
        } catch (error: any) {
            handleError(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleScannerClose = () => {
        setShowScanner(false);
    };

    const renderBookItem = ({ item }: { item: SearchBookResult }) => {
        // Procesar autores: puede venir como array de strings o array de objetos
        let authors = 'Autor desconocido';
        if (item.authors && item.authors.length > 0) {
            authors = item.authors
                .map(a => typeof a === 'string' ? a : a.name)
                .filter(name => name && name.trim() !== '')
                .join(', ');
            
            if (!authors) {
                authors = 'Autor desconocido';
            }
        }

        // Verificar si el libro ya está en la biblioteca
        const isInLibrary = libraryISBNs.has(item.isbn);

        return (
            <TouchableOpacity 
                className="flex-row bg-background-light rounded-lg p-4 mb-3 shadow-sm"
                onPress={() => handleBookPress(item)}
                activeOpacity={0.7}
            >
                {/* Portada */}
                <View className="w-20 h-32 bg-primary/10 rounded-md mr-4 overflow-hidden">
                    {item.cover_url ? (
                        <Image 
                            source={{ uri: item.cover_url }} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Ionicons name="book-outline" size={28} color="#8A817C" />
                        </View>
                    )}
                </View>

                {/* Información */}
                <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-1.5">
                        <Text 
                            className="font-montserratSemiBold text-base text-text-dark flex-1"
                            numberOfLines={2}
                        >
                            {item.title}
                        </Text>
                    </View>
                    <Text 
                        className="font-montserrat text-sm text-text-light"
                        numberOfLines={1}
                    >
                        {authors}
                    </Text>
                    {isInLibrary && (
                        <View className="flex-row items-center mt-1.5">
                            <Ionicons name="checkmark-circle" size={14} color="#4C956C" />
                            <Text className="font-montserrat text-xs ml-1" style={{ color: '#4C956C' }}>
                                En tu biblioteca
                            </Text>
                        </View>
                    )}
                </View>

                {/* Icono de flecha */}
                <View className="justify-center ml-2">
                    <Ionicons name="chevron-forward" size={22} color="#8A817C" />
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => {
        if (isSearching) return null;
        
        if (hasSearched && searchResults.length === 0) {
            return (
                <View className="items-center justify-center py-12">
                    <Ionicons name="search-outline" size={64} color="#BCB8B1" />
                    <Text className="font-montserratSemiBold text-lg text-text-dark mt-4">
                        No se encontraron resultados
                    </Text>
                    <Text className="font-montserrat text-sm text-text-light mt-2 text-center px-8">
                        Intenta buscar con otros términos o usa el escáner
                    </Text>
                </View>
            );
        }

        if (!hasSearched) {
            return (
                <View className="items-center justify-center py-12">
                    <Ionicons name="compass-outline" size={64} color="#BCB8B1" />
                    <Text className="font-montserratSemiBold text-lg text-text-dark mt-4">
                        Descubre nuevos libros
                    </Text>
                    <Text className="font-montserrat text-sm text-text-light mt-2 text-center px-8">
                        Busca por título o autor, o escanea el código de barras de un libro
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header */}
            <View className="px-4 pt-4 pb-3 bg-background border-b border-primary/10 items-center">
                <Text className="font-lora text-3xl text-text-dark mb-4">
                    Explorar
                </Text>

                {/* Barra de búsqueda */}
                <View className="flex-row items-center gap-3">
                    <View className="flex-1 flex-row items-center bg-background-light rounded-full px-5 py-4 border border-primary/20">
                        <Ionicons name="search-outline" size={22} color="#8A817C" />
                        <TextInput
                            className="flex-1 ml-3 font-montserrat text-base text-text-dark"
                            placeholder="Buscar por título o autor..."
                            placeholderTextColor="#BCB8B1"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity 
                                onPress={handleClearSearch} 
                                activeOpacity={0.6}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close-circle" size={20} color="#8A817C" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Botón de escaneo */}
                    <TouchableOpacity 
                        className="bg-accent rounded-full p-4 shadow-md"
                        onPress={handleScanPress}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="barcode-outline" size={26} color="#F8F4F1" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Resultados */}
            <View className="flex-1">
                {isSearching && (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#4C956C" />
                        <Text className="font-montserrat text-sm text-text-light mt-3">
                            Buscando...
                        </Text>
                    </View>
                )}

                <FlatList
                    data={searchResults}
                    renderItem={renderBookItem}
                    keyExtractor={(item, index) => `${item.isbn}-${index}`}
                    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Escáner de código de barras */}
            <BarcodeScanner
                visible={showScanner}
                onClose={handleScannerClose}
                onBarcodeScanned={handleBarcodeScanned}
            />
        </SafeAreaView>
    );
};

export default Explore;