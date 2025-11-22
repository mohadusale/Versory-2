import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerModalProps {
    visible: boolean;
    title: string;
    date: Date;
    minimumDate?: Date;
    maximumDate?: Date;
    onConfirm: (date: Date) => void;
    onCancel: () => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
    visible,
    title,
    date,
    minimumDate,
    maximumDate,
    onConfirm,
    onCancel,
}) => {
    const [selectedDate, setSelectedDate] = useState(date);

    React.useEffect(() => {
        if (visible) {
            setSelectedDate(date);
        }
    }, [visible, date]);

    const handleDateChange = (event: DateTimePickerEvent, newDate?: Date) => {
        if (Platform.OS === 'android') {
            if (event.type === 'set' && newDate) {
                setSelectedDate(newDate);
                onConfirm(newDate);
            } else if (event.type === 'dismissed') {
                onCancel();
            }
        } else {
            // iOS: actualizar en tiempo real
            if (newDate) {
                setSelectedDate(newDate);
            }
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedDate);
    };

    // En Android, el picker se muestra y se cierra automáticamente
    if (Platform.OS === 'android') {
        return (
            <>
                {visible && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        locale="es-ES"
                    />
                )}
            </>
        );
    }

    // En iOS, mostramos un modal con el picker y botones de confirmación
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.overlayTouchable} onPress={onCancel} />
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <Pressable onPress={onCancel} style={styles.closeButton} hitSlop={8}>
                            <Ionicons name="close" size={24} color="#463F3A" />
                        </Pressable>
                    </View>

                    {/* Date Picker Nativo iOS */}
                    <View style={styles.pickerContainer}>
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="spinner"
                            onChange={handleDateChange}
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                            locale="es-ES"
                            textColor="#463F3A"
                            style={styles.iosDatePicker}
                        />

                        {/* Fecha seleccionada */}
                        <View style={styles.selectedDateContainer}>
                            <Text style={styles.selectedDateText}>
                                {selectedDate.toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </Text>
                        </View>
                    </View>

                    {/* Botones */}
                    <View style={styles.buttonRow}>
                        <Pressable
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    overlayTouchable: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#F4F3EE',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(70, 63, 58, 0.1)',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Lora_700Bold',
        color: '#463F3A',
    },
    closeButton: {
        padding: 4,
    },
    pickerContainer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    iosDatePicker: {
        height: 200,
        width: '100%',
    },
    selectedDateContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(224, 175, 160, 0.3)',
        marginTop: 16,
    },
    selectedDateText: {
        fontSize: 16,
        fontFamily: 'Lora_700Bold',
        color: '#463F3A',
    },
    buttonRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'white',
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

export default DatePickerModal;

