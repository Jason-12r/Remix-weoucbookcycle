import { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Market } from './pages/Market';
import { Post } from './pages/Post';
import { Messages } from './pages/Messages';
import { UserProfile } from './pages/UserProfile';
import { BookDetail } from './pages/BookDetail';
import { ChatDetail } from './pages/ChatDetail';
import { UsageInstructionsModal } from './components/UsageInstructionsModal';
import { AnimatePresence, motion } from 'motion/react';
import { users as initialUsers, chats as initialChats, messages as initialMessages, books as initialBooks, ChatMessage } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(initialUsers['me'].wishlist);
  const [chats, setChats] = useState(initialChats);
  const [messages, setMessages] = useState(initialMessages);
  const [users, setUsers] = useState(initialUsers);
  const [books, setBooks] = useState(initialBooks);
  const [evaluatedBookIds, setEvaluatedBookIds] = useState<string[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Show instructions on first load
    setShowInstructions(true);
  }, []);

  const handleBookClick = (id: string) => {
    setSelectedBookId(id);
  };

  const handleChatClick = (id: string) => {
    setSelectedChatId(id);
  };

  const handleSellerClick = (sellerId: string) => {
    setViewingUserId(sellerId);
  };

  const handleToggleWishlist = (bookId: string) => {
    setWishlist(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  const handleStartChat = (sellerId: string) => {
    if (sellerId === 'me') return;

    // Find existing chat
    const existingChat = chats.find(c => c.participants.includes(sellerId) && c.participants.includes('me'));
    
    if (existingChat) {
      setSelectedChatId(existingChat.id);
      setSelectedBookId(null);
      setViewingUserId(null);
      setActiveTab('messages');
    } else {
      // Create a new mock chat session
      const newChatId = `c${Date.now()}`;
      const newChat = {
        id: newChatId,
        participants: ['me', sellerId],
        lastMessage: '',
        lastMessageTime: 'Now',
        unreadCount: 0
      };
      setChats(prev => [...prev, newChat]);
      setMessages(prev => ({ ...prev, [newChatId]: [] }));
      setSelectedChatId(newChatId);
      setSelectedBookId(null);
      setViewingUserId(null);
      setActiveTab('messages');
    }
  };

  const handleSendMessage = (chatId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: 'me',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage: text, lastMessageTime: 'Now' }
        : chat
    ));
  };

  const handleEvaluate = (sellerId: string, bookId: string, isGood: boolean) => {
    setEvaluatedBookIds(prev => [...prev, bookId]);
    
    setUsers(prevUsers => {
      const seller = prevUsers[sellerId];
      if (!seller) return prevUsers;

      const newRating = isGood ? seller.rating + 1 : seller.rating - 1;
      const newTrustScore = isGood ? seller.trustScore : Math.max(0, seller.trustScore - 10);
      
      const updatedSeller = { 
        ...seller, 
        rating: newRating,
        trustScore: newTrustScore 
      };

      // If trust score drops to 60 or below, remove their listings
      if (newTrustScore <= 60) {
        setBooks(prevBooks => prevBooks.filter(book => book.sellerId !== sellerId));
        updatedSeller.listings = [];
      }

      return { ...prevUsers, [sellerId]: updatedSeller };
    });
  };

  const handleBack = () => {
    if (selectedChatId) {
      setSelectedChatId(null);
      return;
    }
    if (viewingUserId) {
      setViewingUserId(null);
      return;
    }
    if (selectedBookId) {
      setSelectedBookId(null);
      return;
    }
  };

  const handleStartChatFromProfile = () => {
    if (viewingUserId) {
      handleStartChat(viewingUserId);
    }
  };

  const renderContent = () => {
    if (selectedChatId) {
      const chat = chats.find(c => c.id === selectedChatId);
      if (!chat) return null;

      return (
        <ChatDetail 
          id={selectedChatId} 
          onBack={handleBack} 
          messages={messages[selectedChatId] || []}
          onSendMessage={(text) => handleSendMessage(selectedChatId, text)}
          chat={chat}
          onSellerClick={(sellerId) => {
            setViewingUserId(sellerId);
            setSelectedChatId(null);
          }}
        />
      );
    }

    if (viewingUserId) {
      return (
        <UserProfile 
          userId={viewingUserId} 
          onBack={handleBack} 
          onChat={handleStartChatFromProfile}
          onBookClick={handleBookClick}
          wishlist={viewingUserId === 'me' ? wishlist : undefined}
          onToggleWishlist={viewingUserId === 'me' ? handleToggleWishlist : undefined}
          user={users[viewingUserId]}
          books={books}
        />
      );
    }

    if (selectedBookId) {
      return (
        <BookDetail 
          id={selectedBookId} 
          onBack={handleBack} 
          onChat={(sellerId) => handleStartChat(sellerId)}
          onSellerClick={handleSellerClick}
          isWishlisted={wishlist.includes(selectedBookId)}
          onToggleWishlist={() => handleToggleWishlist(selectedBookId)}
          onEvaluate={(sellerId, isGood) => handleEvaluate(sellerId, selectedBookId, isGood)}
          isEvaluated={evaluatedBookIds.includes(selectedBookId)}
          book={books.find(b => b.id === selectedBookId)!}
          seller={users[books.find(b => b.id === selectedBookId)!.sellerId]}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Home 
            onBookClick={handleBookClick} 
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            books={books}
            onShowInstructions={() => setShowInstructions(true)}
          />
        );
      case 'market':
        return (
          <Market 
            onBookClick={handleBookClick} 
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            books={books}
          />
        );
      case 'post':
        return <Post onBack={() => setActiveTab('home')} user={users['me']} />;
      case 'messages':
        return (
          <Messages 
            onChatClick={handleChatClick} 
            chats={chats} 
            users={users} 
            onShowInstructions={() => setShowInstructions(true)}
            onUserClick={handleSellerClick}
          />
        );
      case 'profile':
        return (
          <UserProfile 
            userId="me" 
            onBookClick={handleBookClick}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            user={users['me']}
            books={books}
          />
        );
      default:
        return <Home onBookClick={handleBookClick} books={books} />;
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans pb-20 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <UsageInstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedBookId ? 'book' : selectedChatId ? 'chat' : viewingUserId ? 'user' : activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {!selectedBookId && !selectedChatId && !viewingUserId && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}
