import React from 'react';
import { RideGroup, Language } from '../types';
import { translations } from '../constants';
import { RideCard } from './RideCard';

interface HomeScreenProps {
  rides: RideGroup[];
  language: Language;
  onSelectRide: (rideId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ rides, language, onSelectRide }) => {
  const t = translations[language];

  return (
    <div className="p-4 pt-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text tracking-tight">{t.discoverRides}</h1>
        <p className="text-brand-text-secondary mt-1 max-w-md mx-auto">
          {t.discoverSub}
        </p>
      </div>
      <div>
        {rides.length > 0 ? (
          rides.map(ride => (
            <RideCard key={ride.id} ride={ride} language={language} onClick={() => onSelectRide(ride.id)} />
          ))
        ) : (
          <p className="text-center text-brand-text-secondary mt-8">{t.noDiscoverRides}</p>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;