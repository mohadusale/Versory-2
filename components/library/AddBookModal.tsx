import { Book, BookStatus } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddBookModalProps {
    visible: boolean;
    book: Book | null;
    onClose: () => void;
    onStatusSelect: (status: BookStatus) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({
    visible,
    book,
    onClose,
    onStatusSelect,
}) => {
    if (!book) return null;

    const options: { label: string; status: BookStatus; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
        { label: 'Por Leer', status: 'TR', icon: 'bookmark-outline', color: '#E0AFA0' },
        { label: 'Leyendo', status: 'RD', icon: 'book-outline', color: '#D4A373' },
        { label: 'Finalizado', status: 'FN', icon: 'checkmark-circle-outline', color: '#4C956C' },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                onPress={onClose}
                activeOpacity={1}
            >
                <TouchableOpacity 
                    style={styles.modalContent} 
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header con Miniatura del Libro */}
                    <View style={styles.header}>
                        <Image
                            source={{ uri: book.cover_url || 'https://placehold.co/120x184/292524/6B6664?text=No+Cover' }}
                            style={styles.cover}
                            contentFit="cover"
                        />
                        <View style={styles.headerText}>
                            <Text 
                                style={styles.title} 
                                numberOfLines={2}
                            >
                                {book.title}
                            </Text>
                            <Text style={styles.subtitle}>
                                Selecciona un estado
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Opciones */}
                    <View style={styles.optionsContainer}>
                        {options.map((opt) => (
                            <TouchableOpacity
                                key={opt.status}
                                style={styles.optionButton}
                                activeOpacity={0.7}
                                onPress={() => {
                                    onClose();
                                    onStatusSelect(opt.status);
                                }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: opt.color + '20' }]}>
                                    <Ionicons name={opt.icon} size={24} color={opt.color} />
                                </View>
                                <Text style={styles.optionText}>
                                    {opt.label}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color="#8A817C" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Botón Cancelar */}
                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelText}>
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
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
        gap: 12,
    },
    cover: {
        width: 52,
        height: 78,
        borderRadius: 6,
        backgroundColor: '#E5E5E5',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#463F3A',
        marginBottom: 4,
        lineHeight: 20,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '400',
        color: '#8A817C',
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginVertical: 12,
    },
    optionsContainer: {
        gap: 10,
        marginVertical: 8,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: '#F8F8F8',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#463F3A',
        lineHeight: 20,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 4,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E0AFA0',
        lineHeight: 20,
    },
});

export default AddBookModal;

