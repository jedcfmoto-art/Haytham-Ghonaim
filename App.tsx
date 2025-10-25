import React, { useState, useEffect, useMemo } from 'react';
import { Page, Language, RideGroup, User, Message } from './types';
import { MOCK_RIDES, MOCK_USERS, MOCK_MESSAGES, translations } from './constants';
import Navbar from './components/Navbar';
import HomeScreen from './components/HomeScreen';
import MyRidesScreen from './components/MyRidesScreen';
import CreateRideScreen from './components/CreateRideScreen';
import ProfileScreen from './components/ProfileScreen';
import RideDetailScreen from './components/RideDetailScreen';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [activeRideId, setActiveRideId] = useState<string | null>(null);

  const [users] = useState<User[]>(MOCK_USERS);
  const [rides, setRides] = useState<RideGroup[]>(MOCK_RIDES);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleLogin = (userId: string) => {
    setCurrentUserId(userId);
    setCurrentPage('Home');
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setActiveRideId(null);
  };

  const handleNavigation = (page: Page) => {
    setActiveRideId(null); // Reset active ride when changing main tabs
    setCurrentPage(page);
  };

  const handleSelectRide = (rideId: string) => {
    setActiveRideId(rideId);
    setCurrentPage('RideDetail');
  };

  const handleCreateRide = (newRideData: Omit<RideGroup, 'id' | 'participants' | 'rideStatus' | 'ratings' | 'distance' | 'duration' >) => {
    if(!currentUserId) return;
    const newRide: RideGroup = {
      ...newRideData,
      id: `r${Date.now()}`,
      participants: [currentUserId],
      rideStatus: 'Upcoming'
    };
    setRides(prevRides => [newRide, ...prevRides]);
    setCurrentPage('My Rides');
  };
  
  const handleJoinLeaveRide = (rideId: string) => {
    if(!currentUserId) return;
    setRides(prevRides => prevRides.map(ride => {
      if (ride.id === rideId) {
        const isParticipant = ride.participants.includes(currentUserId);
        if (isParticipant) {
          if (ride.createdBy === currentUserId) return ride;
          return { ...ride, participants: ride.participants.filter(id => id !== currentUserId) };
        } else {
          return { ...ride, participants: [...ride.participants, currentUserId] };
        }
      }
      return ride;
    }));
  };

  const handleSendMessage = (rideId: string, message: string) => {
    if(!currentUserId) return;
    const newMessage: Message = {
      id: `m${Date.now()}`,
      rideId,
      senderId: currentUserId,
      message,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const handleAddParticipant = (rideId: string, userIdToAdd: string) => {
      setRides(prevRides => prevRides.map(ride => {
        if (ride.id === rideId) {
          if (ride.participants.includes(userIdToAdd)) return ride;
          return { ...ride, participants: [...ride.participants, userIdToAdd] };
        }
        return ride;
      }));
  };

  const handleRemoveParticipant = (rideId: string, userIdToRemove: string) => {
      setRides(prevRides => prevRides.map(ride => {
        if (ride.id === rideId) {
           if (ride.createdBy === userIdToRemove) return ride;
          return { ...ride, participants: ride.participants.filter(id => id !== userIdToRemove) };
        }
        return ride;
      }));
  };

  const handleUpdateRideStatus = (rideId: string, status: RideGroup['rideStatus']) => {
    setRides(prevRides => prevRides.map(ride => ride.id === rideId ? { ...ride, rideStatus: status } : ride));
  };

  const handleRateRide = (rideId: string, rating: number) => {
    if(!currentUserId) return;
    setRides(prevRides => prevRides.map(ride => {
      if (ride.id === rideId) {
        const existingRatings = ride.ratings?.filter(r => r.userId !== currentUserId) || [];
        const newRatings = [...existingRatings, { userId: currentUserId, rating }];
        return { ...ride, ratings: newRatings };
      }
      return ride;
    }));
  };

  const discoverableRides = useMemo(() => {
    if (!currentUserId) return [];
    const now = new Date();
    return rides.filter(ride => 
      ride.rideStatus === 'Upcoming' && 
      !ride.participants.includes(currentUserId) &&
      new Date(ride.date) >= now
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [rides, currentUserId]);


  const renderPage = () => {
    if (!currentUser || !currentUserId) return null;

    if (currentPage === 'RideDetail' && activeRideId) {
        const ride = rides.find(r => r.id === activeRideId);
        if (ride) {
            return <RideDetailScreen 
                        ride={ride} 
                        users={users} 
                        messages={messages} 
                        currentUser={currentUser} 
                        language={language} 
                        onJoinLeaveRide={handleJoinLeaveRide} 
                        onSendMessage={handleSendMessage}
                        onAddParticipant={handleAddParticipant}
                        onRemoveParticipant={handleRemoveParticipant}
                        onUpdateRideStatus={handleUpdateRideStatus}
                        onRateRide={handleRateRide}
                    />;
        }
    }

    switch (currentPage) {
      case 'Home':
        return <HomeScreen rides={discoverableRides} language={language} onSelectRide={handleSelectRide} />;
      case 'My Rides':
        return <MyRidesScreen rides={rides} users={users} currentUserId={currentUserId} language={language} onSelectRide={handleSelectRide} />;
      case 'Create Ride':
        return <CreateRideScreen language={language} currentUserId={currentUserId} onCreateRide={handleCreateRide} />;
      case 'Profile':
        return <ProfileScreen user={currentUser} language={language} onLogout={handleLogout} />;
      case 'Chat': // Fallback to My Rides for now
        return <MyRidesScreen rides={rides} users={users} currentUserId={currentUserId} language={language} onSelectRide={handleSelectRide} />;
      default:
        return <HomeScreen rides={discoverableRides} language={language} onSelectRide={handleSelectRide} />;
    }
  };

  if (!currentUserId || !currentUser) {
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
            <div className="fixed top-0 left-0 right-0 bg-brand-surface p-2 z-10 flex justify-end items-center shadow-md">
                <button
                    onClick={toggleLanguage}
                    className="bg-brand-secondary text-white font-bold py-1 px-3 rounded-md text-sm"
                >
                    {language === 'en' ? 'العربية' : 'English'}
                </button>
            </div>
            <LoginScreen users={users} language={language} onLogin={handleLogin} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <div className="fixed top-0 left-0 right-0 bg-brand-surface p-2 z-10 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold text-brand-primary px-4">{translations[language].appName}</h1>
        <button
          onClick={toggleLanguage}
          className="bg-brand-secondary text-white font-bold py-1 px-3 rounded-md text-sm"
        >
          {language === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      <main className="pt-16 pb-24">
        {renderPage()}
      </main>

      <Navbar activePage={currentPage} onNavigate={handleNavigation} language={language} />
    </div>
  );
};

export default App;