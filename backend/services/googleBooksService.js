import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

class GoogleBooksService {
  // Wyszukaj książki w Google Books
  static async searchBooks(query, maxResults = 10, startIndex = 0) {
    try {
      const params = {
        q: query,
        maxResults: maxResults,
        startIndex: startIndex,
        key: API_KEY,
        langRestrict: "pl", // Możesz zmienić na 'en' lub usunąć
      };

      const response = await axios.get(GOOGLE_BOOKS_API_URL, { params });

      if (!response.data.items) {
        return [];
      }

      // Przetwórz wyniki do bardziej czytelnej formy
      return response.data.items.map((item) => this.formatBookData(item));
    } catch (error) {
      console.error("Error searching Google Books:", error.message);
      throw new Error("Błąd podczas wyszukiwania książek w Google Books");
    }
  }

  // Pobierz szczegóły książki po ID z Google Books
  static async getBookById(googleBooksId) {
    try {
      const response = await axios.get(
        `${GOOGLE_BOOKS_API_URL}/${googleBooksId}`,
        { params: { key: API_KEY } }
      );

      return this.formatBookData(response.data);
    } catch (error) {
      console.error("Error fetching book from Google Books:", error.message);
      throw new Error("Błąd podczas pobierania książki z Google Books");
    }
  }

  // Wyszukaj po ISBN
  static async searchByISBN(isbn) {
    try {
      const response = await axios.get(GOOGLE_BOOKS_API_URL, {
        params: {
          q: `isbn:${isbn}`,
          key: API_KEY,
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      return this.formatBookData(response.data.items[0]);
    } catch (error) {
      console.error("Error searching by ISBN:", error.message);
      throw new Error("Błąd podczas wyszukiwania książki po ISBN");
    }
  }

  // Wyszukaj po tytule
  static async searchByTitle(title, maxResults = 10) {
    return this.searchBooks(`intitle:${title}`, maxResults);
  }

  // Wyszukaj po autorze
  static async searchByAuthor(author, maxResults = 10) {
    return this.searchBooks(`inauthor:${author}`, maxResults);
  }

  // Formatuj dane książki z Google Books
  static formatBookData(item) {
    const volumeInfo = item.volumeInfo || {};
    const saleInfo = item.saleInfo || {};

    // Wyciągnij ISBN-13 lub ISBN-10
    let isbn = null;
    if (volumeInfo.industryIdentifiers) {
      const isbn13 = volumeInfo.industryIdentifiers.find(
        (id) => id.type === "ISBN_13"
      );
      const isbn10 = volumeInfo.industryIdentifiers.find(
        (id) => id.type === "ISBN_10"
      );
      isbn = isbn13?.identifier || isbn10?.identifier || null;
    }

    return {
      googleBooksId: item.id,
      title: volumeInfo.title || "Brak tytułu",
      authors: volumeInfo.authors || [],
      author: volumeInfo.authors
        ? volumeInfo.authors.join(", ")
        : "Nieznany autor",
      publisher: volumeInfo.publisher || null,
      publishedDate: volumeInfo.publishedDate || null,
      publicationYear: volumeInfo.publishedDate
        ? parseInt(volumeInfo.publishedDate.substring(0, 4))
        : null,
      description: volumeInfo.description || null,
      isbn: isbn,
      pageCount: volumeInfo.pageCount || null,
      categories: volumeInfo.categories || [],
      language: volumeInfo.language || null,
      imageLinks: {
        thumbnail: volumeInfo.imageLinks?.thumbnail || null,
        smallThumbnail: volumeInfo.imageLinks?.smallThumbnail || null,
      },
      previewLink: volumeInfo.previewLink || null,
      infoLink: volumeInfo.infoLink || null,
      averageRating: volumeInfo.averageRating || null,
      ratingsCount: volumeInfo.ratingsCount || null,
      price: saleInfo.listPrice || null,
    };
  }

  // Zaawansowane wyszukiwanie z filtrami
  static async advancedSearch(filters) {
    const {
      title,
      author,
      isbn,
      subject,
      publisher,
      maxResults = 10,
      startIndex = 0,
    } = filters;

    let queryParts = [];

    if (title) queryParts.push(`intitle:${title}`);
    if (author) queryParts.push(`inauthor:${author}`);
    if (isbn) queryParts.push(`isbn:${isbn}`);
    if (subject) queryParts.push(`subject:${subject}`);
    if (publisher) queryParts.push(`inpublisher:${publisher}`);

    if (queryParts.length === 0) {
      throw new Error("Podaj przynajmniej jedno kryterium wyszukiwania");
    }

    const query = queryParts.join("+");
    return this.searchBooks(query, maxResults, startIndex);
  }
}

export default GoogleBooksService;
