export interface User {
    id: number,
    username: string;
    email: string;
}

export interface Author {
    id: number;
    name: string;
}

export interface Genre {
    id: number;
    name: string;
} 

export interface Book {
    isbn: string;
    title: string;
    pages_count: number;
    description: string | null;
    cover_url: string | null;
    published_date: string | null;
    authors: Author[];
    genres: Genre[];
    source: string;
}

export interface UserBook {
    id: number;
    book: Book;
    status: 'TR' | 'RD' | 'FN';
    status_display: string;
    start_date: string | null;
    pages_read: number | null;
    finished_date: string | null;
    rating: number | null;
}