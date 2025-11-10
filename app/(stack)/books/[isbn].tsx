import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const Book = () => {
    const { isbn } = useLocalSearchParams();
    
    return (
        <View>
            <Text>Book {isbn}</Text>
        </View>
    )
}

export default Book;

