import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router'; // <--- IMPORTACIÓN MODIFICADA
import React, { useMemo, useState, useEffect } from 'react'; // <--- IMPORTACIÓN MODIFICADA
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
    // 1. Recogemos los parámetros de la navegación
    const params = useLocalSearchParams<{ action?: string }>();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchBookResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const handleError = useErrorHandler({ title: 'Error de Búsqueda' });
    
    // 2. Efecto para abrir el escáner si se solicita vía parámetros
    useEffect(() => {
        if (params.action === 'scan') {
            setShowScanner(true);
            // Limpiamos el parámetro para que no se vuelva a abrir si navegamos adelante/atrás
            router.setParams({ action: '' });
        }
    }, [params.action]);

    // ... (El resto del código se mantiene EXACTAMENTE igual que lo tenías) ...
    // Copia desde aquí hacia abajo el resto de tu lógica original:
    
    const { readingBooks, toReadBooks, finishedBooks } = useLibrary();
    
    const libraryISBNs = useMemo(() => {
        const allBooks = [...readingBooks, ...toReadBooks, ...finishedBooks];
        return new Set(allBooks.map(userBook => userBook.book.isbn));
    }, [readingBooks, toReadBooks, finishedBooks]);
    
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
            setIsSearching(true);
            const userBookId = libraryBooksMap.get(book.isbn);
            
            if (userBookId) {
                router.push(`/(stack)/books/${userBookId}`);
                return;
            }
            
            const result = await apiSearchBook(book.isbn);
            
            if (result.status === 'not_found') {
                alert('Libro no encontrado. Intenta con otro.');
                return;
            }
            
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
                const userBookId = libraryBooksMap.get(result.data.isbn);
                
                if (userBookId) {
                    router.push(`/(stack)/books/${userBookId}`);
                } else {
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

        const isInLibrary = libraryISBNs.has(item.isbn);

        return (
            <TouchableOpacity 
                className="flex-row bg-white rounded-lg p-4 mb-3 shadow-sm border border-primary/10" 
                onPress={() => handleBookPress(item)}
                activeOpacity={0.7}
            >
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

                <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-1.5">
                        <Text 
                            className="font-montserrat-bold text-base text-text-dark flex-1"
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
                    <Text className="font-montserrat-bold text-lg text-text-dark mt-4">
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
                    <Text className="font-montserrat-bold text-lg text-text-dark mt-4">
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
            <View className="px-4 pt-4 pb-3 bg-background border-b border-primary/10 items-center">
                <Text className="font-lora text-3xl text-text-dark mb-4">
                    Explorar
                </Text>

                <View className="flex-row items-center gap-3">
                    <View className="flex-1 flex-row items-center bg-white rounded-full px-5 py-4 border border-primary/20 shadow-sm">
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

                    <TouchableOpacity 
                        className="bg-accent rounded-full p-4 shadow-md"
                        onPress={handleScanPress}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="barcode-outline" size={26} color="#F8F4F1" />
                    </TouchableOpacity>
                </View>
            </View>

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

            <BarcodeScanner
                visible={showScanner}
                onClose={handleScannerClose}
                onBarcodeScanned={handleBarcodeScanned}
            />
        </SafeAreaView>
    );
};

export default Explore;