import { UserBook } from "@/types/types";
import { Link } from "expo-router";
import { Image, TouchableOpacity } from "react-native";


const BookGridItem: React.FC<{ item: UserBook }> = ({ item }) => {
    return (
        <Link href={`/books/${item.id}`} asChild>
            <TouchableOpacity className="w-1/4 p-1 active:opacity-70">
                <Image
                    source={{ uri: item.book.cover_url || 'https://placehold.co/120x184/292524/6B6664?text=No+Cover' }}
                    className="w-full aspect-[2/3] rounded-md bg-stone-700 border border-text-dark"
                    resizeMode="cover"
                />
            </TouchableOpacity>
        </Link>
    );
};

export default BookGridItem;