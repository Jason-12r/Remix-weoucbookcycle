import { User, BookItem, ChatSession, ChatMessage } from '../data/mockData';

export const api = {
  init: async () => {
    const res = await fetch('/api/init');
    return res.json() as Promise<{
      users: Record<string, User>;
      books: BookItem[];
      chats: ChatSession[];
      messages: Record<string, ChatMessage[]>;
    }>;
  },

  postBook: async (book: BookItem) => {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    return res.json() as Promise<BookItem>;
  },

  startChat: async (sellerId: string) => {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    });
    return res.json() as Promise<ChatSession>;
  },

  sendMessage: async (chatId: string, text: string, senderId: string) => {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, text, senderId }),
    });
    return res.json() as Promise<ChatMessage>;
  },

  evaluateUser: async (sellerId: string, isGood: boolean) => {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, isGood }),
    });
    return res.json() as Promise<User>;
  },

  toggleWishlist: async (bookId: string) => {
    const res = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    });
    return res.json() as Promise<string[]>; // Returns updated wishlist
  }
};
