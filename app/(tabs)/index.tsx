import CurrentReadCard from '@/components/home/CurrentReadCard';
import HomeBookCard from '@/components/home/HomeBookCard';
import StreakCard from '@/components/home/StreakCard';
import YearlyProgressCard from '@/components/home/YearlyProgressCard';
import { useAuthStore } from '@/store/authStore';
import { useLibrary } from '@/hooks/useLibrary';
import { apiGetGamificationStats } from '@/lib/api'; // <--- Importar API
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query'; // <--- Importar React Query
import { Link, router, useFocusEffect } from 'expo-router'; // Importar useFocusEffect
import React, { useMemo, useCallback } from 'react';
import { Dimensions, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
    const { user } = useAuthStore();
    const { readingBooks, toReadBooks, isLoading: libraryLoading, refresh: refreshLibrary } = useLibrary();
    
    // Fetch de Gamificación
    const { data: stats, isLoading: statsLoading, refetch: refreshStats } = useQuery({
        queryKey: ['gamification'],
        queryFn: apiGetGamificationStats,
    });

    // Refrescar datos al volver a la pantalla (importante para que la racha se actualice si leíste)
    useFocusEffect(
        useCallback(() => {
            refreshStats();
        }, [])
    );

    const onRefresh = async () => {
        await Promise.all([refreshLibrary(), refreshStats()]);
    };
    
    const isLoading = libraryLoading || statsLoading;

    const { width } = Dimensions.get('window');
    const CARD_WIDTH = width - 40; 

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 20) return 'Buenas tardes';
        return 'Buenas noches';
    }, []);

    // Ordenar libros por progreso
    const sortedReadingBooks = useMemo(() => {
        return [...readingBooks].sort((a, b) => {
            const pagesA = a.book.pages_count || 1;
            const readA = a.pages_read || 0;
            const percentA = readA / pagesA;

            const pagesB = b.book.pages_count || 1;
            const readB = b.pages_read || 0;
            const percentB = readB / pagesB;

            return percentB - percentA;
        });
    }, [readingBooks]);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView 
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#E0AFA0" />
                }
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mt-6 mb-6">
                    <View>
                        <Text className="text-text-light font-montserrat text-sm mb-1">
                            {greeting},
                        </Text>
                        <Text className="text-text-dark font-lora text-2xl">
                            {user?.username || 'Lector'}
                        </Text>
                    </View>
                    <Link href="/profile" asChild>
                        <TouchableOpacity className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center border border-primary/30">
                            <Ionicons name="person" size={20} color="#E0AFA0" />
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* --- NUEVO: SECCIÓN DE GAMIFICACIÓN --- */}
                {stats && (
                    <View className="flex-row mb-8">
                        <StreakCard 
                            streak={stats.streak} 
                            activityDates={stats.activity_dates} 
                        />
                        <YearlyProgressCard 
                            read={stats.yearly_challenge.read}
                            goal={stats.yearly_challenge.goal}
                            year={stats.yearly_challenge.year}
                            onPress={() => { /* Futuro: Abrir modal para editar meta */ }}
                        />
                    </View>
                )}

                {/* Sección 1: Currently Reading */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-end mb-2">
                        <Text className="text-lg font-montserrat-bold text-text-dark">
                            Leyendo ahora {sortedReadingBooks.length > 0 && `(${sortedReadingBooks.length})`}
                        </Text>
                        <Link href="/library" asChild>
                            <TouchableOpacity>
                                <Ionicons name="library-outline" size={20} color="#E0AFA0" />
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {sortedReadingBooks.length > 0 ? (
                        <View className="-mx-5">
                            <FlatList
                                data={sortedReadingBooks}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={CARD_WIDTH + 16}
                                decelerationRate="fast"
                                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={{ width: CARD_WIDTH, marginRight: 16 }}>
                                        <CurrentReadCard item={item} />
                                    </View>
                                )}
                            />
                        </View>
                    ) : (
                        <View className="bg-white rounded-2xl p-6 shadow-sm border border-primary/20 items-center border-dashed mt-2">
                            <View className="bg-background rounded-full p-4 mb-3">
                                <Ionicons name="book-outline" size={32} color="#BCB8B1" />
                            </View>
                            <Text className="font-lora text-lg text-text-dark mb-2 text-center">
                                No estás leyendo nada
                            </Text>
                            <Text className="font-montserrat text-sm text-text-light text-center mb-4 px-4">
                                Explora tu biblioteca o busca un nuevo libro para comenzar tu aventura.
                            </Text>
                            <TouchableOpacity 
                                className="bg-accent px-6 py-3 rounded-xl"
                                onPress={() => router.push('/explore')}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-montserrat-bold text-sm">
                                    Explorar libros
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Sección 2: Siguientes por leer */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-end mb-2 px-1">
                        <Text className="text-lg font-montserrat-bold text-text-dark">
                            Siguientes por leer {toReadBooks.length > 0 && `(${toReadBooks.length})`}
                        </Text>
                        <Link href="/library" asChild>
                            <TouchableOpacity>
                                <Ionicons name="library-outline" size={20} color="#E0AFA0" />
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {toReadBooks.length > 0 ? (
                        <View className="-mx-5">
                            <FlatList
                                data={toReadBooks}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => <HomeBookCard item={item} />}
                            />
                        </View>
                    ) : (
                        <View className="bg-primary/5 rounded-xl p-6 items-center justify-center border border-primary/10 mt-2">
                            <Text className="font-montserrat text-text-light text-center text-sm mb-3">
                                Tu lista de lectura está vacía.
                            </Text>
                            <Link href="/explore" asChild>
                                <TouchableOpacity className="flex-row items-center">
                                    <Text className="text-accent font-montserrat-bold text-sm">
                                        Buscar inspiración
                                    </Text>
                                    <Ionicons name="arrow-forward" size={16} color="#E0AFA0" className="ml-1"/>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    )}
                </View>

                {/* Sección 3: Acciones Rápidas */}
                <View className="pb-8">
                    <Text className="text-lg font-montserrat-bold text-text-dark mb-4">
                        Acciones rápidas
                    </Text>
                    <View className="flex-row gap-3">
                        <Link href="/explore?action=scan" asChild>
                            <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl items-center justify-center border border-primary/10 shadow-sm active:bg-gray-50">
                                <View className="bg-accent/10 p-3 rounded-full mb-2">
                                    <Ionicons name="scan-outline" size={24} color="#E0AFA0" />
                                </View>
                                <Text className="font-montserrat-medium text-xs text-text-dark">
                                    Escanear
                                </Text>
                            </TouchableOpacity>
                        </Link>
                        
                        <Link href="/explore" asChild>
                            <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl items-center justify-center border border-primary/10 shadow-sm active:bg-gray-50">
                                <View className="bg-accent/10 p-3 rounded-full mb-2">
                                    <Ionicons name="search-outline" size={24} color="#E0AFA0" />
                                </View>
                                <Text className="font-montserrat-medium text-xs text-text-dark">
                                    Buscar
                                </Text>
                            </TouchableOpacity>
                        </Link>

                        <Link href="/profile" asChild>
                            <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl items-center justify-center border border-primary/10 shadow-sm active:bg-gray-50">
                                <View className="bg-accent/10 p-3 rounded-full mb-2">
                                    <Ionicons name="stats-chart-outline" size={24} color="#E0AFA0" />
                                </View>
                                <Text className="font-montserrat-medium text-xs text-text-dark">
                                    Estadísticas
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}