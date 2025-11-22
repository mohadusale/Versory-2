import { BookStatus, UserBook } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface BookOptionsModalProps {
    visible: boolean;
    book: UserBook | null;
    onClose: () => void;
    onStatusSelect: (status: BookStatus) => void;
}

const BookOptionsModal: React.FC<BookOptionsModalProps> = ({
    visible,
    book,
    onClose,
    onStatusSelect,
}) => {
    if (!book) return null;

    const options: { label: string; status: BookStatus; icon: keyof typeof Ionicons.glyphMap }[] = [
        { label: 'Mover a "Por Leer"', status: 'TR', icon: 'bookmark-outline' },
        { label: 'Mover a "Leyendo"', status: 'RD', icon: 'book-outline' },
        { label: 'Mover a "Finalizado"', status: 'FN', icon: 'checkmark-circle-outline' },
    ];

    // Filtrar la opción actual
    const validOptions = options.filter(opt => opt.status !== book.status);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    {/* Header con Miniatura del Libro */}
                    <View style={styles.header}>
                        <Image
                            source={{ uri: book.book.cover_url || 'https://placehold.co/120x184/292524/6B6664?text=No+Cover' }}
                            style={styles.cover}
                            contentFit="cover"
                        />
                        <View style={styles.headerText}>
                            <Text style={styles.title} numberOfLines={2}>{book.book.title}</Text>
                            <Text style={styles.subtitle}>Selecciona una acción</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Opciones */}
                    <View style={styles.optionsContainer}>
                        {validOptions.map((opt) => (
                            <Pressable
                                key={opt.status}
                                style={({ pressed }) => [styles.optionButton, pressed && styles.optionPressed]}
                                onPress={() => {
                                    onClose();
                                    onStatusSelect(opt.status);
                                }}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name={opt.icon} size={22} color="#463F3A" />
                                </View>
                                <Text style={styles.optionText}>{opt.label}</Text>
                                <Ionicons name="chevron-forward" size={18} color="#8A817C" />
                            </Pressable>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Botón Cancelar */}
                    <Pressable style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </Pressable>
                </Pressable>
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
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
    },
    optionPressed: {
        backgroundColor: '#F0F0F0',
    },
    iconContainer: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
    optionText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#463F3A',
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

export default BookOptionsModal;
