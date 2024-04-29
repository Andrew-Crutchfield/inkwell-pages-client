import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GET, POST, PUT, DELETE } from '../services/fetcher';
import { Book, Category } from '../types/types';


const BookListing: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', price: '', categoryId: '' });
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const fetchBooks = async () => {
    console.log("fetchBooks()");
    try {
      const response = await GET<{ books: Book[] }>('/api/books');
      console.log(response.books);
      setBooks(response.books);
      const categoriesResponse = await GET<{ categories: Category[] }>('/api/categories');
      setCategories(categoriesResponse.categories);
    } catch (error) {
      console.error('Error fetching books', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async () => {
    try {
      const bookData = {
        title: newBook.title,
        author: newBook.author,
        price: newBook.price ? parseFloat(newBook.price) : undefined,
        categoryid: parseInt(newBook.categoryId),
      };
      await POST<Book>('/api/books', bookData);
      setNewBook({ title: '', author: '', price: '', categoryId: '' });
      await fetchBooks();
    } catch (error) {
      console.error('Error adding book', error);
    }
  };

  const handleEditBook = async () => {
    if (editingBook) {
      try {
        console.log("handleEditBook");
        console.log(editingBook);
        console.log(newBook);
        await PUT<Book>(`/api/books/${editingBook.id}`, newBook);
        setEditingBook(null);
        // setNewBook({ title: '', author: '', price: '', categoryId: '' });
        await fetchBooks();
      } catch (error) {
        console.error('Error editing book', error);
      }
    }
  };

  const handleStartEditing = (book: Book) => {
    console.log("handleStartEditing");
    console.log(book);
    setEditingBook(book);
    setNewBook({
      title: book.title,
      author: book.author,
      price: book.price ? String(book.price) : '',
      categoryId: String(book.categoryId),
    });
  };

  const handleCancelEditing = () => {
    setEditingBook(null);
    setNewBook({ title: '', author: '', price: '', categoryId: '' });
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await DELETE(`/api/books/${id}`);
      await fetchBooks();
    } catch (error) {
      console.error('Error deleting book', error);
    }
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <div>
      <h1>Book Listing</h1>
      <Link to="/bookdetails">Go to Book Details</Link>

      <h2>{editingBook ? 'Edit Book' : 'Add a New Book'}</h2>
      <input
        type="text"
        placeholder="Title"
        value={newBook.title}
        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Author"
        value={newBook.author}
        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={newBook.price}
        onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
      />
      <select
        value={newBook.categoryId}
        onChange={(e) => setNewBook({ ...newBook, categoryId: e.target.value })}
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {editingBook ? (
        <>
          <button onClick={handleEditBook}>Save</button>
          <button onClick={handleCancelEditing}>Cancel</button>
        </>
      ) : (
        <button onClick={handleAddBook}>Add Book</button>
      )}

      <h2>Books</h2>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <div>
              <h3>{book.title}</h3>
              <p>Author: {book.author}</p>
              <p>Price: ${book.price}</p>
              <p>Category: {getCategoryName(book.categoryId)}</p>
            </div>
            <div>
              <button onClick={() => handleStartEditing(book)}>Edit</button>
              <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookListing;
