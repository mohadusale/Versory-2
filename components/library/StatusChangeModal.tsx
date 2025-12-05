import DatePickerModal from '@/components/common/DatePickerModal';
import NumberPicker from '@/components/common/NumberPicker';
import StarRating from '@/components/common/StarRating';
import { BookStatus } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface StatusChangeModalProps {
    visible: boolean;
    targetStatus: BookStatus;
    currentStartDate?: string | null;
    bookPagesCount: number;
    onConfirm: (data: { status: BookStatus; start_date?: string; finished_date?: string; rating?: number; pages_read?: number }) => void;
    onCancel: () => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
    visible,
    targetStatus,
    currentStartDate,
    bookPagesCount,
    onConfirm,
    onCancel,
}) => {
    const today = new Date();
    const [startDate, setStartDate] = useState<Date>(today);
    const [finishedDate, setFinishedDate] = useState<Date>(today);
    const [rating, setRating] = useState<number>(3);
    const [pagesRead, setPagesRead] = useState<number>(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerType, setDatePickerType] = useState<'start' | 'finish'>('start');

    const getTitle = () => {
        if (targetStatus === 'RD') return 'Empezar a leer';
        if (targetStatus === 'FN') return 'Marcar como leído';
        return 'Cambiar estado';
    };

    const getIcon = (): keyof typeof Ionicons.glyphMap => {
        if (targetStatus === 'RD') return 'book';
        if (targetStatus === 'FN') return 'checkmark-circle';
        return 'bookmark';
    };

    const handleConfirm = () => {
        const data: { status: BookStatus; start_date?: string; finished_date?: string; rating?: number; pages_read?: number } = {
            status: targetStatus,
        };

        if (targetStatus === 'RD') {
            data.start_date = startDate.toISOString().split('T')[0];
            data.pages_read = pagesRead;
        } else if (targetStatus === 'FN') {
            data.finished_date = finishedDate.toISOString().split('T')[0];
            data.rating = rating;
            
            // Si no hay start_date previo, usar la fecha de finalización
            if (!currentStartDate) {
                data.start_date = finishedDate.toISOString().split('T')[0];
            }
        }

        onConfirm(data);
    };

    const openDatePicker = (type: 'start' | 'finish') => {
        setDatePickerType(type);
        setShowDatePicker(true);
    };

    const handleDateConfirm = (date: Date) => {
        if (datePickerType === 'start') {
            setStartDate(date);
        } else {
            setFinishedDate(date);
        }
        setShowDatePicker(false);
    };

    return (
        <>
            <Modal
                visible={visible && !showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={onCancel}
            >
                <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
                            <View style={styles.modalContent}>
                        {/* Header con icono */}
                        <View style={styles.iconContainer}>
                            <Ionicons name={getIcon()} size={48} color="#E0AFA0" />
                        </View>

                        <Text style={styles.title}>{getTitle()}</Text>

                        {/* CONTENIDO: Cambia según el estado */}
                        {targetStatus === 'RD' && (
                            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
                                <View style={styles.content}>
                                    <Text style={styles.label}>Fecha de inicio</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => openDatePicker('start')}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="calendar" size={20} color="#463F3A" />
                                        <Text style={styles.dateText}>
                                            {startDate.toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#8A817C" />
                                    </TouchableOpacity>
                                    <Text style={styles.hint}>
                                        Puedes cambiar esta fecha más tarde
                                    </Text>

                                    <View style={styles.divider} />

                                    <NumberPicker
                                        value={pagesRead}
                                        minValue={0}
                                        maxValue={bookPagesCount}
                                        onChange={setPagesRead}
                                        label="¿Cuántas páginas has leído?"
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        )}

                        {targetStatus === 'FN' && (
                            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
                                <View style={styles.content}>
                                    <Text style={styles.label}>Fecha de finalización</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => openDatePicker('finish')}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="calendar" size={20} color="#463F3A" />
                                        <Text style={styles.dateText}>
                                            {finishedDate.toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#8A817C" />
                                    </TouchableOpacity>

                                    <View style={styles.divider} />

                                    <Text style={styles.label}>¿Cómo lo calificarías?</Text>
                                    <StarRating rating={rating} onRate={setRating} size={36} showText />
                                </View>
                            </TouchableWithoutFeedback>
                        )}

                        {targetStatus === 'TR' && (
                            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
                                <View style={styles.content}>
                                    <Text style={styles.emptyMessage}>
                                        El libro se moverá a "Por Leer"
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        )}

                        {/* Botones */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleConfirm}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.confirmButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* DatePicker Modal - Renderizado independientemente */}
            {showDatePicker && (
                <DatePickerModal
                    visible={showDatePicker}
                    title={datePickerType === 'start' ? 'Fecha de inicio' : 'Fecha de finalización'}
                    date={datePickerType === 'start' ? startDate : finishedDate}
                    maximumDate={today}
                    onConfirm={handleDateConfirm}
                    onCancel={() => setShowDatePicker(false)}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Lora_700Bold',
        color: '#463F3A',
        textAlign: 'center',
        marginBottom: 24,
    },
    content: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#463F3A',
        marginBottom: 8,
    },
    sublabel: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
        marginBottom: 16,
        textAlign: 'center',
    },
    hint: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
        marginTop: 8,
        textAlign: 'center',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F3EE',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(70, 63, 58, 0.1)',
        gap: 12,
    },
    dateText: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Montserrat_500Medium',
        color: '#463F3A',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(70, 63, 58, 0.1)',
        marginVertical: 24,
    },
    emptyMessage: {
        fontSize: 15,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
        textAlign: 'center',
        paddingVertical: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F4F3EE',
        borderWidth: 1,
        borderColor: 'rgba(70, 63, 58, 0.2)',
    },
    cancelButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#463F3A',
    },
    confirmButton: {
        backgroundColor: '#E0AFA0',
    },
    confirmButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: 'white',
    },
});

export default StatusChangeModal;

