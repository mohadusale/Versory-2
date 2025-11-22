import StarRating from '@/components/common/StarRating';
import SimpleConfirmModal from '@/components/library/SimpleConfirmModal';
import StatusChangeModal from '@/components/library/StatusChangeModal';
import { useBookMutations } from '@/hooks/useBookMutations';
import { BookStatus, UserBook } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface BookControlCardProps {
    book: UserBook;
}

const BookControlCard: React.FC<BookControlCardProps> = ({ book }) => {
    const { changeStatus, updateProgress, updateRating } = useBookMutations(book.id.toString());

    const [pagesInput, setPagesInput] = useState(book.pages_read?.toString() || '0');
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCompleteConfirmModal, setShowCompleteConfirmModal] = useState(false);
    const [targetStatus, setTargetStatus] = useState<BookStatus>('TR');

    useEffect(() => {
        setPagesInput(book.pages_read?.toString() || '0');
    }, [book.pages_read]);

    // Maneja el click en un tab
    const handleTabPress = useCallback((newStatus: BookStatus) => {
        if (newStatus === book.status) return; // Ya está en ese estado

        // Si cambia a "Por Leer", mostrar modal de confirmación
        if (newStatus === 'TR') {
            setTargetStatus(newStatus);
            setShowConfirmModal(true);
            return;
        }

        // Para "Leyendo" y "Leído", abrir modal
        setTargetStatus(newStatus);
        setShowModal(true);
    }, [book.status, changeStatus]);

    // Confirma el cambio de estado desde el modal
    const handleModalConfirm = useCallback(
        async (data: { status: BookStatus; start_date?: string; finished_date?: string; rating?: number; pages_read?: number }) => {
            setShowModal(false);
            await changeStatus(data);
        },
        [changeStatus]
    );

    const handlePageSubmit = useCallback(() => {
        const pages = parseInt(pagesInput);
        if (isNaN(pages)) return;

        const finalPages = Math.max(0, Math.min(pages, book.book.pages_count));
        setPagesInput(finalPages.toString());

        if (finalPages !== book.pages_read) {
            updateProgress({ id: book.id, pages: finalPages });
        }

        // Si llegó al 100%, sugerir pasar a Leído
        if (finalPages === book.book.pages_count && book.status === 'RD') {
            setShowCompleteConfirmModal(true);
        }
    }, [pagesInput, book.pages_read, book.book.pages_count, book.id, book.status, updateProgress]);

    const handleRatingChange = useCallback(
        (rating: number) => {
            updateRating({ id: book.id, rating });
        },
        [book.id, updateRating]
    );

    // Funciones para el modal de confirmación "Por Leer"
    const handleConfirmToRead = useCallback(async () => {
        setShowConfirmModal(false);
        await changeStatus({ status: 'TR' });
    }, [changeStatus]);

    const handleCancelConfirm = useCallback(() => {
        setShowConfirmModal(false);
    }, []);

    // Funciones para el modal de confirmación "Completar libro"
    const handleConfirmComplete = useCallback(() => {
        setShowCompleteConfirmModal(false);
        setTargetStatus('FN');
        setShowModal(true);
    }, []);

    const handleCancelComplete = useCallback(() => {
        setShowCompleteConfirmModal(false);
    }, []);

    // --- RENDERIZADO DE BOTONES (Memoizado) ---
    const statusButtons = useMemo(() => {
        const statuses: BookStatus[] = ['TR', 'RD', 'FN'];
        
        return statuses.map((status) => {
            const isActive = book.status === status;
            
            let label = 'Por Leer';
            let icon: keyof typeof Ionicons.glyphMap = 'bookmark-outline';
            
            if (status === 'RD') { label = 'Leyendo'; icon = 'book-outline'; }
            if (status === 'FN') { label = 'Leído'; icon = 'checkmark-circle-outline'; }

            return (
                <Pressable
                    key={status}
                    onPress={() => handleTabPress(status)}
                    style={[styles.tabButton, isActive && styles.activeTab]}
                >
                    <Ionicons 
                        name={isActive ? icon.replace('-outline', '') as any : icon} 
                        size={18} 
                        color={isActive ? '#E0AFA0' : '#8A817C'} 
                    />
                    {isActive && (
                        <Text style={styles.activeTabText}>{label}</Text>
                    )}
                </Pressable>
            );
        });
    }, [book.status, handleTabPress]);

    const progressPercentage = Math.round(((parseInt(pagesInput) || 0) / book.book.pages_count) * 100);
    const isComplete = progressPercentage >= 100;

    return (
        <>
            <View style={styles.card}>
                <View style={styles.tabContainer}>
                    {statusButtons}
                </View>

                {book.status === 'RD' && (
                    <View>
                        <View style={styles.progressInfo}>
                            <Text style={styles.label}>TU PROGRESO</Text>
                            <Text style={[styles.label, isComplete && styles.completeText]}>
                                {progressPercentage}%
                            </Text>
                        </View>
                        <View style={styles.progressRow}>
                            <View style={styles.progressBarBg}>
                                <View 
                                    style={[
                                        styles.progressBarFill, 
                                        isComplete && styles.progressBarComplete,
                                        { width: `${Math.min(progressPercentage, 100)}%` }
                                    ]} 
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput 
                                    value={pagesInput}
                                    onChangeText={setPagesInput}
                                    onEndEditing={handlePageSubmit}
                                    onSubmitEditing={handlePageSubmit}
                                    keyboardType="number-pad"
                                    style={styles.input}
                                    maxLength={5}
                                    returnKeyType="done"
                                />
                                <Text style={styles.unitText}>/ {book.book.pages_count}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {book.status === 'FN' && (
                    <View style={styles.centerContent}>
                        {book.rating ? (
                            <>
                                <StarRating 
                                    rating={book.rating} 
                                    onRate={handleRatingChange}
                                    size={40}
                                />
                            </>
                        ) : (
                            <>
                                <Text style={[styles.label, { marginBottom: 16 }]}>¿CÓMO LO CALIFICARÍAS?</Text>
                                <StarRating 
                                    rating={0} 
                                    onRate={handleRatingChange}
                                    size={40}
                                />
                                <Text style={styles.hint}>Toca una estrella para valorar este libro</Text>
                            </>
                        )}
                    </View>
                )}

                {book.status === 'TR' && (
                    <View style={styles.centerContent}>
                        <Text style={styles.quoteText}>
                            "Un lector vive mil vidas antes de morir..."
                        </Text>
                    </View>
                )}
            </View>

            {/* Modal de cambio de estado */}
            <StatusChangeModal
                visible={showModal}
                targetStatus={targetStatus}
                currentStartDate={book.start_date}
                bookPagesCount={book.book.pages_count}
                onConfirm={handleModalConfirm}
                onCancel={() => setShowModal(false)}
            />

            {/* Modal de confirmación para "Por Leer" */}
            <SimpleConfirmModal
                visible={showConfirmModal}
                title="Cambiar estado"
                message="¿Mover este libro a 'Por Leer'? Se borrarán las fechas y el progreso."
                confirmText="Confirmar"
                cancelText="Cancelar"
                onConfirm={handleConfirmToRead}
                onCancel={handleCancelConfirm}
                icon="bookmark"
            />

            {/* Modal de confirmación para "Completar libro" */}
            <SimpleConfirmModal
                visible={showCompleteConfirmModal}
                title="¡Felicidades!"
                message="¿Has terminado el libro? ¿Quieres marcarlo como leído?"
                confirmText="Sí, marcar como leído"
                cancelText="Ahora no"
                onConfirm={handleConfirmComplete}
                onCancel={handleCancelComplete}
                icon="checkmark-circle"
            />
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 24,
        marginTop: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(188, 184, 177, 0.2)',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F4F3EE',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    activeTabText: {
        fontSize: 12,
        fontFamily: 'Montserrat_700Bold',
        color: '#463F3A',
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
        marginBottom: 8,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 12,
        backgroundColor: '#F4F3EE',
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#E0AFA0',
        borderRadius: 999,
    },
    progressBarComplete: {
        backgroundColor: '#4CAF50',
    },
    completeText: {
        color: '#4CAF50',
        fontFamily: 'Montserrat_700Bold',
    },
    hint: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
        marginTop: 8,
        textAlign: 'center',
    },
    inputContainer: {
        backgroundColor: '#F4F3EE',
        borderWidth: 1,
        borderColor: 'rgba(188, 184, 177, 0.3)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        minWidth: 100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        fontFamily: 'Montserrat_500Medium',
        color: '#463F3A',
        textAlign: 'right',
        minWidth: 40,
        fontSize: 14,
    },
    unitText: {
        fontSize: 12,
        color: '#8A817C',
        marginLeft: 4,
        fontFamily: 'Montserrat_400Regular',
    },
    centerContent: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    quoteText: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        fontStyle: 'italic',
        color: '#8A817C',
        textAlign: 'center',
    }
});

export default BookControlCard;