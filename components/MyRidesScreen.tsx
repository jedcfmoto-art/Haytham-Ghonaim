import React, { useState, useMemo } from 'react';
import { RideGroup, Language, User } from '../types';
import { translations } from '../constants';
import { RideCard } from './RideCard';

interface MyRidesScreenProps {
  rides: RideGroup[];
  users: User[];
  currentUserId: string;
  language: Language;
  onSelectRide: (rideId: string) => void;
}

const MyRidesScreen: React.FC<MyRidesScreenProps> = ({ rides, currentUserId, language, onSelectRide }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const t = translations[language];

  const { upcomingRides, pastRides } = useMemo(() => {
    const userRides = rides.filter(ride => ride.participants.includes(currentUserId));
    const now = new Date();
    return {
      upcomingRides: userRides.filter(ride => new Date(ride.date) >= now && ride.rideStatus === 'Upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      pastRides: userRides.filter(ride => new Date(ride.date) < now || ride.rideStatus !== 'Upcoming').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }, [rides, currentUserId]);

  const renderRides = (rideList: RideGroup[]) => {
    if (rideList.length === 0) {
      return <p className="text-center text-brand-text-secondary mt-8">{activeTab === 'upcoming' ? t.noUpcomingRides : t.noPastRides}</p>;
    }
    return rideList.map(ride => (
      <RideCard key={ride.id} ride={ride} language={language} onClick={() => onSelectRide(ride.id)} />
    ));
  };
  
  return (
    <div className="p-4 pt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">{t.navMyRides}</h1>
      <div className="flex justify-center bg-brand-surface rounded-full p-1 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === 'upcoming' ? 'bg-brand-primary text-gray-900' : 'text-brand-text'}`}
        >
          {t.upcomingRides}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === 'past' ? 'bg-brand-primary text-gray-900' : 'text-brand-text'}`}
        >
          {t.pastRides}
        </button>
      </div>
      <div>
        {activeTab === 'upcoming' ? renderRides(upcomingRides) : renderRides(pastRides)}
      </div>
    </div>
  );
};

export default MyRidesScreen;