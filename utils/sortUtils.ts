/**
 * Utilidades para ordenar libros
 */

import { SortOption, UserBook } from '@/types/types';

/**
 * Obtiene el nombre del primer autor de un libro
 * @param book - Libro a procesar
 * @returns Nombre del autor o string vacío
 */
const getAuthorName = (book: UserBook): string => {
    return book.book.authors[0]?.name || '';
};

/**
 * Obtiene la fecha de cuando se añadió el libro (creación del UserBook)
 * @param book - Libro a procesar
 * @returns Timestamp de creación
 */
const getDateAdded = (book: UserBook): number => {
    // Si tiene created_at, usarlo; sino usar el id como proxy (menor id = más antiguo)
    if (book.created_at) {
        return new Date(book.created_at).getTime();
    }
    return book.id;
};

/**
 * Ordena un array de libros según la opción seleccionada
 * @param books - Array de libros a ordenar
 * @param sortOption - Opción de ordenación
 * @returns Array ordenado (nuevo array, no muta el original)
 */
export const sortBooks = (books: UserBook[], sortOption: SortOption): UserBook[] => {
    // Crear copia para no mutar el array original
    const sorted = [...books];

    switch (sortOption) {
        case 'title_asc':
            return sorted.sort((a, b) => 
                a.book.title.localeCompare(b.book.title, 'es', { sensitivity: 'base' })
            );
        
        case 'title_desc':
            return sorted.sort((a, b) => 
                b.book.title.localeCompare(a.book.title, 'es', { sensitivity: 'base' })
            );
        
        case 'author_asc':
            return sorted.sort((a, b) => {
                const authorA = getAuthorName(a);
                const authorB = getAuthorName(b);
                return authorA.localeCompare(authorB, 'es', { sensitivity: 'base' });
            });
        
        case 'author_desc':
            return sorted.sort((a, b) => {
                const authorA = getAuthorName(a);
                const authorB = getAuthorName(b);
                return authorB.localeCompare(authorA, 'es', { sensitivity: 'base' });
            });
        
        case 'date_added_asc':
            return sorted.sort((a, b) => getDateAdded(a) - getDateAdded(b));
        
        case 'date_added_desc':
            return sorted.sort((a, b) => getDateAdded(b) - getDateAdded(a));
        
        case 'rating_asc':
            return sorted.sort((a, b) => {
                // Libros sin rating van al final
                if (a.rating === null) return 1;
                if (b.rating === null) return -1;
                return a.rating - b.rating;
            });
        
        case 'rating_desc':
            return sorted.sort((a, b) => {
                // Libros sin rating van al final
                if (a.rating === null) return 1;
                if (b.rating === null) return -1;
                return b.rating - a.rating;
            });
        
        case 'pages_asc':
            return sorted.sort((a, b) => 
                a.book.pages_count - b.book.pages_count
            );
        
        case 'pages_desc':
            return sorted.sort((a, b) => 
                b.book.pages_count - a.book.pages_count
            );
        
        default:
            return sorted;
    }
};

/**
 * Obtiene un texto descriptivo de la ordenación actual
 * @param sortOption - Opción de ordenación
 * @returns Texto descriptivo corto
 */
export const getSortDescription = (sortOption: SortOption): string => {
    const descriptions: Record<SortOption, string> = {
        'title_asc': 'A-Z',
        'title_desc': 'Z-A',
        'author_asc': 'Autor A-Z',
        'author_desc': 'Autor Z-A',
        'date_added_asc': 'Más antiguos',
        'date_added_desc': 'Más recientes',
        'rating_asc': '⭐ Menor',
        'rating_desc': '⭐ Mayor',
        'pages_asc': '📖 Menos páginas',
        'pages_desc': '📖 Más páginas',
    };
    
    return descriptions[sortOption];
};

