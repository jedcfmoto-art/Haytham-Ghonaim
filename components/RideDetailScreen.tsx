
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RideGroup, User, Message, Language } from '../types';
import { translations } from '../constants';
import { SendIcon, MapPinIcon, StarIcon, SOSIcon } from './icons';

interface RideDetailScreenProps {
  ride: RideGroup;
  users: User[];
  messages: Message[];
  currentUser: User;
  language: Language;
  onJoinLeaveRide: (rideId: string) => void;
  onSendMessage: (rideId: string, message: string) => void;
  onAddParticipant: (rideId: string, userId: string) => void;
  onRemoveParticipant: (rideId: string, userId: string) => void;
  onUpdateRideStatus: (rideId: string, status: RideGroup['rideStatus']) => void;
  onRateRide: (rideId: string, rating: number) => void;
}

const RideDetailScreen: React.FC<RideDetailScreenProps> = (props) => {
  const { ride, users, messages, currentUser, language, onJoinLeaveRide, onSendMessage, onAddParticipant, onRemoveParticipant, onUpdateRideStatus, onRateRide } = props;
  const t = translations[language];
  const creator = users.find(u => u.id === ride.createdBy);
  const isParticipant = ride.participants.includes(currentUser.id);
  const isCreator = ride.createdBy === currentUser.id;
  const [newMessage, setNewMessage] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const userHasRated = useMemo(() => ride.ratings?.some(r => r.userId === currentUser.id), [ride.ratings, currentUser.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if(newMessage.trim()){
      onSendMessage(ride.id, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleEmergencyShare = () => {
    if (!currentUser.emergencyContact) {
      alert("No emergency contact set in your profile.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const message = `${t.emergencyMessage} https://www.google.com/maps?q=${latitude},${longitude}`;
        window.location.href = `sms:${currentUser.emergencyContact?.phone}?body=${encodeURIComponent(message)}`;
      },
      (err) => {
        alert("Could not get your location. Please enable location services.");
        console.error(err);
      }
    );
  };

  const rideMessages = messages.filter(m => m.rideId === ride.id).sort((a,b) => a.timestamp - b.timestamp);

  const rideDate = new Date(ride.date);
  const formattedDate = rideDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = rideDate.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  const potentialParticipants = users.filter(u => !ride.participants.includes(u.id));
  
  const averageRating = useMemo(() => {
    if (!ride.ratings || ride.ratings.length === 0) return 0;
    const sum = ride.ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ride.ratings.length).toFixed(1);
  }, [ride.ratings]);

  const statusColors: { [key in RideGroup['rideStatus']]: string } = {
    Upcoming: 'bg-blue-500 text-white',
    Ongoing: 'bg-green-500 text-white',
    Completed: 'bg-gray-600 text-gray-200',
    Cancelled: 'bg-red-500 text-white'
  };

  return (
    <div className="p-4 pt-10">
      <div className="bg-brand-surface rounded-lg p-4 shadow-lg mb-6">
        <h1 className="text-3xl font-bold text-brand-primary">{ride.name}</h1>
        <p className="text-brand-text-secondary mt-1">{ride.destination.name}</p>
        
        <div className="my-4 h-48 rounded-md overflow-hidden bg-gray-700">
            <iframe className="w-full h-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(ride.destination.name)}&output=embed`} title={`Map of ${ride.destination.name}`}></iframe>
        </div>

        <p className="text-brand-text mt-4">{ride.description}</p>
        <div className="mt-4 space-y-2 text-sm">
            <p><strong className="text-brand-text-secondary">{t.rideDate}:</strong> {formattedDate}</p>
            <p><strong className="text-brand-text-secondary">{t.rideTime}:</strong> {formattedTime}</p>
            <p><strong className="text-brand-text-secondary">{t.createdBy}:</strong> {creator?.name || 'Unknown'}</p>
            <p><strong className="text-brand-text-secondary">{t.status}:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ride.rideStatus]}`}>{ride.rideStatus}</span></p>
        </div>
         <a href={ride.destination.mapsLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center bg-brand-secondary text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600">
            <MapPinIcon className="h-5 w-5 me-2" />
            {t.viewOnMap}
         </a>
      </div>

      {isParticipant && ride.rideStatus !== 'Completed' && (
        <div className="mb-6">
          <button onClick={handleEmergencyShare} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-full shadow-lg hover:bg-red-700">
            <SOSIcon className="h-6 w-6" /> {t.emergencyShare}
          </button>
        </div>
      )}

      {isCreator && ride.rideStatus !== 'Completed' && ride.rideStatus !== 'Cancelled' && (
        <div className="mb-6">
            {ride.rideStatus === 'Upcoming' && <button onClick={() => onUpdateRideStatus(ride.id, 'Ongoing')} className="w-full bg-green-600 text-white font-bold py-3 rounded-full">{t.startRide}</button>}
            {ride.rideStatus === 'Ongoing' && <button onClick={() => onUpdateRideStatus(ride.id, 'Completed')} className="w-full bg-brand-primary text-gray-900 font-bold py-3 rounded-full">{t.endRide}</button>}
        </div>
      )}
      
      {ride.rideStatus === 'Completed' && (
        <div className="bg-brand-surface rounded-lg p-4 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-3">{t.rideStats}</h2>
            <div className="flex justify-around text-center">
                <div>
                    <p className="text-2xl font-bold text-brand-primary">{ride.distance || 'N/A'}<span className="text-sm"> km</span></p>
                    <p className="text-xs text-brand-text-secondary">{t.distance}</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-brand-primary">{ride.duration || 'N/A'}</p>
                    <p className="text-xs text-brand-text-secondary">{t.duration}</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-brand-primary flex items-baseline justify-center gap-1">{averageRating} <StarIcon className="h-4 w-4 text-yellow-400" filled={true}/></p>
                    <p className="text-xs text-brand-text-secondary">{t.avgRating}</p>
                </div>
            </div>
        </div>
      )}

      <div className="bg-brand-surface rounded-lg p-4 shadow-lg mb-6">
        <h2 className="text-xl font-bold mb-3">{t.participants} ({ride.participants.length})</h2>
        <div className="space-y-3">
          {ride.participants.map(pid => {
            const user = users.find(u => u.id === pid);
            return user ? (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-brand-bg">
                <div className="flex items-center gap-3">
                    <img src={user.photo} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                    <span className="font-medium text-brand-text">{user.name}</span>
                </div>
                {isCreator && user.id !== currentUser.id && ride.rideStatus === 'Upcoming' && (
                    <button onClick={() => onRemoveParticipant(ride.id, user.id)} className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-700 transition-colors">
                        {t.remove}
                    </button>
                )}
              </div>
            ) : null
          })}
        </div>
      </div>

      {isCreator && ride.rideStatus === 'Upcoming' && (
        <div className="bg-brand-surface rounded-lg p-4 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-3">{t.addParticipant}</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto">
             {potentialParticipants.length > 0 ? potentialParticipants.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-brand-bg">
                    <div className="flex items-center gap-3">
                        <img src={user.photo} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                        <span className="font-medium text-brand-text">{user.name}</span>
                    </div>
                    <button onClick={() => onAddParticipant(ride.id, user.id)} className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-green-700 transition-colors">
                        {t.add}
                    </button>
                </div>
             )) : <p className="text-sm text-brand-text-secondary text-center p-2">All users have joined.</p>}
            </div>
        </div>
      )}
      
       {isParticipant && ride.rideStatus !== 'Completed' && (
        <div className="bg-brand-surface rounded-lg p-4 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-3">{t.chat}</h2>
            <div className="h-64 overflow-y-auto mb-4 p-2 bg-brand-bg rounded-md flex flex-col space-y-3">
              {rideMessages.map(msg => {
                const sender = users.find(u => u.id === msg.senderId);
                const isCurrentUserMsg = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUserMsg ? 'ms-auto flex-row-reverse' : ''}`}>
                    <img src={sender?.photo} alt={sender?.name} className="h-8 w-8 rounded-full object-cover" />
                    <div className={`max-w-xs p-3 rounded-lg ${isCurrentUserMsg ? 'bg-brand-primary text-gray-900 rounded-br-none' : 'bg-gray-700 text-brand-text rounded-bl-none'}`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={t.messagePlaceholder} className="flex-grow bg-brand-bg p-2 rounded-full border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
                <button type="submit" className="bg-brand-primary text-gray-900 p-3 rounded-full"><SendIcon className="h-5 w-5" /></button>
            </form>
        </div>
       )}

      {isParticipant && ride.rideStatus === 'Completed' && (
        <div className="bg-brand-surface rounded-lg p-4 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-3">{t.rateThisRide}</h2>
            {userHasRated ? (
                <p className="text-center text-green-400">{t.thankYouForRating}</p>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="flex text-yellow-400 mb-4" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onMouseEnter={() => setHoverRating(star)} onClick={() => setUserRating(star)}>
                                <StarIcon className="h-10 w-10" filled={(hoverRating || userRating) >= star} />
                            </button>
                        ))}
                    </div>
                    <button onClick={() => onRateRide(ride.id, userRating)} disabled={userRating === 0} className="bg-brand-primary text-gray-900 font-bold py-2 px-6 rounded-full disabled:bg-gray-600">
                        {t.submitRating}
                    </button>
                </div>
            )}
        </div>
      )}

      {ride.rideStatus === 'Upcoming' && (
      <div className="mt-6">
        <button onClick={() => onJoinLeaveRide(ride.id)} className={`w-full font-bold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-300 disabled:opacity-50 ${isParticipant ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-brand-primary hover:bg-brand-primary-hover text-gray-900'}`} disabled={isCreator}>
          {isCreator ? t.leaveRide : (isParticipant ? t.leaveRide : t.joinRide)}
        </button>
      </div>
      )}
    </div>
  );
};

export default RideDetailScreen;