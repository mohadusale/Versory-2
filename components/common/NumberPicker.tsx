import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface NumberPickerProps {
    value: number;
    minValue: number;
    maxValue: number;
    onChange: (value: number) => void;
    label?: string;
}

const NumberPicker: React.FC<NumberPickerProps> = ({
    value,
    minValue,
    maxValue,
    onChange,
    label,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());

    const handleIncrement = () => {
        if (value < maxValue) {
            onChange(value + 1);
        }
    };

    const handleDecrement = () => {
        if (value > minValue) {
            onChange(value - 1);
        }
    };

    const handleTextPress = () => {
        setInputValue(value.toString());
        setIsEditing(true);
    };

    const handleInputChange = (text: string) => {
        // Solo permitir números
        const numericText = text.replace(/[^0-9]/g, '');
        setInputValue(numericText);
    };

    const handleInputSubmit = () => {
        const numValue = parseInt(inputValue) || minValue;
        const clampedValue = Math.max(minValue, Math.min(maxValue, numValue));
        onChange(clampedValue);
        setInputValue(clampedValue.toString());
        setIsEditing(false);
    };

    const handleBlur = () => {
        handleInputSubmit();
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.pickerRow}>
                {/* Botón Menos */}
                <TouchableOpacity
                    style={[styles.button, value <= minValue && styles.buttonDisabled]}
                    onPress={handleDecrement}
                    disabled={value <= minValue}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="remove"
                        size={24}
                        color={value <= minValue ? '#BCB8B1' : '#463F3A'}
                    />
                </TouchableOpacity>

                {/* Número Central */}
                <TouchableOpacity
                    style={styles.valueContainer}
                    onPress={handleTextPress}
                    activeOpacity={0.7}
                >
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={inputValue}
                            onChangeText={handleInputChange}
                            onSubmitEditing={handleInputSubmit}
                            onBlur={handleBlur}
                            keyboardType="number-pad"
                            autoFocus
                            selectTextOnFocus
                            maxLength={5}
                        />
                    ) : (
                        <>
                            <Text style={styles.valueText}>{value}</Text>
                            <Text style={styles.maxText}>/ {maxValue}</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Botón Más */}
                <TouchableOpacity
                    style={[styles.button, value >= maxValue && styles.buttonDisabled]}
                    onPress={handleIncrement}
                    disabled={value >= maxValue}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="add"
                        size={24}
                        color={value >= maxValue ? '#BCB8B1' : '#463F3A'}
                    />
                </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Toca el número para escribir directamente</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#463F3A',
        marginBottom: 12,
        textAlign: 'center',
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F4F3EE',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(70, 63, 58, 0.1)',
    },
    buttonDisabled: {
        backgroundColor: '#FAFAF9',
        borderColor: 'rgba(188, 184, 177, 0.2)',
    },
    valueContainer: {
        minWidth: 120,
        height: 56,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0AFA0',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    valueText: {
        fontSize: 28,
        fontFamily: 'Montserrat_700Bold',
        color: '#463F3A',
    },
    maxText: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#8A817C',
        marginTop: 2,
    },
    input: {
        fontSize: 28,
        fontFamily: 'Montserrat_700Bold',
        color: '#463F3A',
        textAlign: 'center',
        minWidth: 80,
        padding: 0,
    },
    hint: {
        fontSize: 11,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default NumberPicker;

