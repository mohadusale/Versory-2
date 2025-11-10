import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    value, 
    onChangeText, 
    placeholder = 'Buscar...' 
}) => {
    return (
        <View className="flex-row items-center border-b border-primary/40 pb-2" style={{ width: '50%' }}>
            <Ionicons name="search-outline" size={20} color="#8A817C" />
            <TextInput
                className="flex-1 ml-2 text-sm font-montserrat text-text-dark"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#BCB8B1"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ paddingVertical: 4 }}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')} activeOpacity={0.6}>
                    <Ionicons 
                        name="close-circle" 
                        size={18} 
                        color="#8A817C" 
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SearchBar;

