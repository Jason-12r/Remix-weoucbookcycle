import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

// Initial Data (Copied from mockData to avoid client-side dependencies in server)
const initialUsers = {
  'me': {
    id: 'me',
    name: 'BookLover_99',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    verified: true,
    rating: 0,
    ratingCount: 12,
    sales: 42,
    trustScore: 100,
    joinDate: '2021',
    rank: 'Gold Trader',
    bio: 'Passionate about sci-fi and history books. Always looking for rare editions.',
    location: 'Shanghai, CN',
    wishlist: ['The Three-Body Problem', 'Dune'],
    listings: []
  },
  'alex': {
    id: 'alex',
    name: 'Alex Reads',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
    verified: true,
    rating: 0,
    ratingCount: 48,
    sales: 156,
    trustScore: 100,
    joinDate: '2021',
    rank: 'Silver Trader',
    bio: 'Design student selling textbooks and design resources.',
    location: 'Shanghai, CN',
    wishlist: ['Universal Principles of Design'],
    listings: ['1', '2', '4']
  },
  'sarah': {
    id: 'sarah',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    verified: true,
    rating: 0,
    ratingCount: 35,
    sales: 89,
    trustScore: 100,
    joinDate: '2022',
    rank: 'Silver Trader',
    bio: 'History buff. Selling books I have finished reading.',
    location: 'Beijing, CN',
    wishlist: ['Guns, Germs, and Steel'],
    listings: ['3', '5']
  }
};

const initialBooks = [
  {
    id: '1',
    title: 'The Great Gatsby (Hardcover)',
    author: 'F. Scott Fitzgerald',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    price: 25,
    condition: '98% New',
    sellerId: 'alex',
    description: 'Classic hardcover edition. Barely read, spine is perfect. No markings inside.',
    category: 'Literature',
    tags: ['Classic', 'Fiction'],
    location: 'Shanghai, CN',
    shippingTime: 'Ships within 24h',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1200&fit=crop'],
    isbn: '9780743273565'
  },
  {
    id: '2',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    price: 45,
    condition: 'Like New',
    sellerId: 'alex',
    description: 'Original English version, bought 2 months ago for a design course. The book is in excellent condition with no markings or dog-eared pages inside.',
    category: 'Design',
    tags: ['UX', 'Design', 'Textbook'],
    location: 'Shanghai, CN',
    shippingTime: 'Ships within 24h',
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=1200&fit=crop'],
    isbn: '9780465050659'
  },
  {
    id: '3',
    title: 'Sapiens: A Brief History',
    author: 'Yuval Noah Harari',
    cover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
    price: 35,
    condition: 'New',
    sellerId: 'sarah',
    description: 'Brand new copy, unwanted gift.',
    category: 'History',
    tags: ['History', 'Bestseller'],
    location: 'Beijing, CN',
    shippingTime: 'Ships within 48h',
    images: ['https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&h=1200&fit=crop'],
    isbn: '9780062316097'
  },
  {
    id: '4',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    price: 55,
    condition: '99% New',
    sellerId: 'alex',
    description: 'Essential for any developer. Kept in great condition.',
    category: 'Tech',
    tags: ['Programming', 'Computer Science'],
    location: 'Shenzhen, CN',
    shippingTime: 'Ships within 24h',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=1200&fit=crop'],
    isbn: '9780132350884'
  },
  {
    id: '5',
    title: 'Atomic Design Systems',
    author: 'Brad Frost',
    cover: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=400&h=600&fit=crop',
    price: 42,
    condition: '92% New',
    sellerId: 'sarah',
    description: 'Great resource for UI designers.',
    category: 'Design',
    tags: ['Design', 'System'],
    location: 'Hangzhou, CN',
    shippingTime: 'Ships within 24h',
    images: ['https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=800&h=1200&fit=crop'],
    isbn: '9780998296609'
  }
];

const initialChats = [
  {
    id: '1',
    participants: ['me', 'alex'],
    lastMessage: 'I can send a close-up photo if you\'d like?',
    lastMessageTime: '10:26 AM',
    unreadCount: 0,
    bookId: '2'
  },
  {
    id: '2',
    participants: ['me', 'sarah'],
    lastMessage: 'Is the book "Sapiens" still available?',
    lastMessageTime: '10:42 AM',
    unreadCount: 1,
    bookId: '3'
  }
];

const initialMessages = {
  '1': [
    {
      id: 'm1',
      senderId: 'alex',
      text: 'Hi! I saw you\'re interested in this book. It\'s still available.',
      timestamp: '10:23 AM'
    },
    {
      id: 'm2',
      senderId: 'me',
      text: 'Hello! Yes, I\'ve been looking for this edition specifically. Is the spine condition really as good as new?',
      timestamp: '10:25 AM'
    },
    {
      id: 'm3',
      senderId: 'alex',
      text: 'Absolutely. I bought it for a course but ended up using the digital version mostly. It\'s been sitting on my shelf. I can send a close-up photo if you\'d like?',
      timestamp: '10:26 AM'
    }
  ],
  '2': [
    {
      id: 'm4',
      senderId: 'me',
      text: 'Is the book "Sapiens" still available?',
      timestamp: '10:42 AM'
    },
    {
      id: 'm5',
      senderId: 'sarah',
      text: 'Yes, it is! I can ship it tomorrow.',
      timestamp: '10:45 AM'
    }
  ]
};

// In-memory data store
let users = { ...initialUsers };
let books = [...initialBooks];
let chats = [...initialChats];
let messages = { ...initialMessages };

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/init', (req, res) => {
    res.json({
      users,
      books,
      chats,
      messages
    });
  });

  app.get('/api/books', (req, res) => {
    res.json(books);
  });

  app.post('/api/books', (req, res) => {
    const newBook = req.body;
    books.unshift(newBook);
    // Update user listings
    if (users[newBook.sellerId]) {
      users[newBook.sellerId].listings.push(newBook.id);
    }
    res.json(newBook);
  });

  app.post('/api/chats', (req, res) => {
    const { sellerId } = req.body;
    const existingChat = chats.find(c => c.participants.includes(sellerId) && c.participants.includes('me'));
    
    if (existingChat) {
      res.json(existingChat);
    } else {
      const newChat = {
        id: `c${Date.now()}`,
        participants: ['me', sellerId],
        lastMessage: '',
        lastMessageTime: 'Now',
        unreadCount: 0
      };
      chats.push(newChat);
      messages[newChat.id] = [];
      res.json(newChat);
    }
  });

  app.post('/api/messages', (req, res) => {
    const { chatId, text, senderId } = req.body;
    const newMessage = {
      id: `m${Date.now()}`,
      senderId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (!messages[chatId]) {
      messages[chatId] = [];
    }
    messages[chatId].push(newMessage);

    // Update chat last message
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].lastMessage = text;
      chats[chatIndex].lastMessageTime = 'Now';
    }

    res.json(newMessage);
  });

  app.post('/api/evaluate', (req, res) => {
    const { sellerId, isGood } = req.body;
    const seller = users[sellerId];
    
    if (seller) {
      const newRating = isGood ? seller.rating + 1 : seller.rating - 1;
      const newTrustScore = isGood ? seller.trustScore : Math.max(0, seller.trustScore - 10);
      
      users[sellerId] = {
        ...seller,
        rating: newRating,
        trustScore: newTrustScore
      };

      if (newTrustScore <= 60) {
        books = books.filter(b => b.sellerId !== sellerId);
        users[sellerId].listings = [];
      }
      
      res.json(users[sellerId]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.post('/api/wishlist/toggle', (req, res) => {
    const { bookId } = req.body;
    const me = users['me'];
    if (me.wishlist.includes(bookId)) {
      me.wishlist = me.wishlist.filter(id => id !== bookId);
    } else {
      me.wishlist.push(bookId);
    }
    res.json(me.wishlist);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
