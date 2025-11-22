import { UserBook } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";


interface BookGridItemProps {
    item: UserBook;
    onLongPress?: (book: UserBook) => void;
    showRating?: boolean; // Nueva prop para mostrar rating
}

const BookGridItem: React.FC<BookGridItemProps> = ({ item, onLongPress, showRating = false }) => {
    // Función para renderizar las estrellas
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        // Estrellas llenas
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Ionicons key={`full-${i}`} name="star" size={12} color="#E0AFA0" />
            );
        }

        // Media estrella
        if (hasHalfStar) {
            stars.push(
                <Ionicons key="half" name="star-half" size={12} color="#E0AFA0" />
            );
        }

        // Estrellas vacías
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#E0AFA0" />
            );
        }

        return stars;
    };

    return (
        <Link href={`/books/${item.id}`} asChild>
            <TouchableOpacity
                className="w-1/4 p-1 active:opacity-70"
                onLongPress={() => onLongPress?.(item)}
                delayLongPress={300}
            >
                <Image
                    source={{ uri: item.book.cover_url || 'https://placehold.co/120x184/292524/6B6664?text=No+Cover' }}
                    className="w-full aspect-[2/3] rounded-md bg-stone-700 border border-text-dark"
                    resizeMode="cover"
                />
                {showRating && item.rating !== null && item.rating !== undefined && (
                    <View className="flex-row justify-center items-center mt-1 gap-0.5">
                        {renderStars(item.rating)}
                    </View>
                )}
            </TouchableOpacity>
        </Link>
    );
};

export default BookGridItem;