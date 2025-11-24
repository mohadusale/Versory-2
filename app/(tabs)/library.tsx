import BookListScene from '@/components/library/BookListScene';
import { useLibrary } from '@/hooks/useLibrary';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

const Library = () => {
    const { 
        readingBooks,
        toReadBooks,
        finishedBooks,
        isLoading,
        error,
        refresh,
        totalBooks
    } = useLibrary();

    const layout = useWindowDimensions();
    
    // Estado para saber que pestaña está activa
    const [index, setIndex] = useState(0);

    const [routes] = useState([
        { key: 'reading', title: `Leyendo`},
        { key: 'toRead', title: `Por Leer`},
        { key: 'finished', title: `Finalizados`}
    ]);

    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#E0AFA0" }}
            style={{ backgroundColor: "#F8F5F1" }}
            activeColor='#E0AFA0'
            inactiveColor='#6B6664'
            pressOpacity={0.7}
            scrollEnabled={false}
            tabStyle={{ width: layout.width / 3 }}
        />
    );

    const renderScene = SceneMap({
        reading: () => (
        <BookListScene
            listKey="reading"
            books={readingBooks}
            isLoading={isLoading}
            onRefresh={refresh}
        />
        ),
        toRead: () => (
        <BookListScene
            listKey="toRead"
            books={toReadBooks}
            isLoading={isLoading}
            onRefresh={refresh}
        />
        ),
        finished: () => (
        <BookListScene
            listKey="finished"
            books={finishedBooks}
            isLoading={isLoading}
            onRefresh={refresh}
            showRatingSort={true}
        />
        ),
    });
    
    // Manejo de estados globales (Carga, Error, Vacío) 
    if (isLoading && totalBooks === 0) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#FF7B54" />
            </SafeAreaView>
        );
    }
    
    if (error) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-background p-4">
                <Text className="text-text-light text-center mb-4">Error al cargar tu biblioteca.</Text>
                <TouchableOpacity onPress={() => refresh()} className="bg-accent p-3 rounded-lg">
                    <Text className="text-white font-montserrat-medium">Intentar de nuevo</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    
    // Estado vacío (si no hay libros en TOTAL)
    if (!isLoading && totalBooks === 0) {
        // (Tu componente de "Biblioteca Vacía" que tenías antes iría aquí)
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-background p-4">
                <Text className="text-2xl font-lora-semibold text-text-dark mb-2">
                    Tu biblioteca está vacía
                </Text>
                <Text className="text-base font-montserrat text-text-light text-center mb-6">
                    ¡Busca un libro para añadir el primero!
                </Text>
                <Link href="/(tabs)/explore" asChild>
                    <TouchableOpacity className="bg-accent py-3 px-6 rounded-full">
                        <Text className="text-white font-montserrat-medium text-lg">
                            Buscar libros
                        </Text>
                    </TouchableOpacity>
                </Link>
            </SafeAreaView>
        );
    }
    
    // El Layout Principal con TabView
    return (
    <SafeAreaView 
        className="flex-1 bg-background"
        edges={['top', 'left', 'right']}
    >
        <Text className="text-3xl font-lora text-text-dark text-center mt-5 mb-5">
            Biblioteca
        </Text>
        <TabView
            navigationState={{ index, routes }} // 1. El estado
            renderScene={renderScene} // 2. Qué mostrar
            onIndexChange={setIndex} // 3. Cómo actualizar el estado
            initialLayout={{ width: layout.width }} // 4. Ancho inicial
            renderTabBar={renderTabBar} // 5. Nuestra barra de pestañas personalizada
            style={{ backgroundColor: '#F8F5F1' }}
        />
    </SafeAreaView>
    );
};

export default Library;