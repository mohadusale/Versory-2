import { BookStatus, UserBook } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmationModalProps {
    visible: boolean;
    book: UserBook | null;
    onClose: () => void;
    onMoveToStatus: (status: BookStatus) => void;
    onDelete: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    book,
    onClose,
    onMoveToStatus,
    onDelete,
}) => {
    if (!book) return null;

    // Determinar los dos estados a los que NO pertenece
    const allStatuses: { status: BookStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { status: 'TR', label: 'Por Leer', icon: 'bookmark-outline' },
        { status: 'RD', label: 'Leyendo', icon: 'book-outline' },
        { status: 'FN', label: 'Finalizado', icon: 'checkmark-circle-outline' },
    ];

    const availableStatuses = allStatuses.filter(s => s.status !== book.status);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalContent}>
                    {/* Header con Miniatura del Libro */}
                    <View style={styles.header}>
                        <Image
                            source={{ uri: book.book.cover_url || 'https://placehold.co/120x184/292524/6B6664?text=No+Cover' }}
                            style={styles.cover}
                            contentFit="cover"
                        />
                        <View style={styles.headerText}>
                            <Text style={styles.title} numberOfLines={2}>{book.book.title}</Text>
                            <Text style={styles.subtitle}>¿Qué deseas hacer?</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Opciones de Cambio de Estado */}
                    <View style={styles.optionsContainer}>
                        {availableStatuses.map((statusOption) => (
                            <TouchableOpacity
                                key={statusOption.status}
                                style={styles.optionButton}
                                onPress={() => {
                                    onMoveToStatus(statusOption.status);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: '#E0AFA0' }]}>
                                    <Ionicons name={statusOption.icon} size={20} color="white" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionText}>Mover a "{statusOption.label}"</Text>
                                    <Text style={styles.optionSubtext}>Cambiar el estado del libro</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#8A817C" />
                            </TouchableOpacity>
                        ))}

                        {/* Opción de Eliminar */}
                        <TouchableOpacity
                            style={[styles.optionButton, styles.deleteButton]}
                            onPress={() => {
                                onDelete();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#DC2626' }]}>
                                <Ionicons name="trash-outline" size={20} color="white" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.deleteText}>Eliminar libro</Text>
                                <Text style={styles.deleteSubtext}>Quitar de tu biblioteca</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#DC2626" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Botón Cancelar */}
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
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
        padding: 20,
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    cover: {
        width: 48,
        height: 72,
        borderRadius: 6,
        backgroundColor: '#E5E5E5',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Lora_700Bold',
        color: '#463F3A',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
    },
    divider: {
        height: 1,
        backgroundColor: '#F4F3EE',
        marginVertical: 8,
    },
    optionsContainer: {
        gap: 8,
        marginVertical: 8,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'rgba(224, 175, 160, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    deleteButton: {
        borderColor: 'rgba(220, 38, 38, 0.2)',
        backgroundColor: '#FEFEFE',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionText: {
        fontSize: 15,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#463F3A',
        marginBottom: 2,
    },
    optionSubtext: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
    },
    deleteText: {
        fontSize: 15,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#DC2626',
        marginBottom: 2,
    },
    deleteSubtext: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#DC2626',
        opacity: 0.7,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    cancelText: {
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#E0AFA0',
    },
});

export default ConfirmationModal;
