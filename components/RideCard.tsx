import React, { useMemo } from 'react';
import { RideGroup, Language } from '../types';
import { StarIcon } from './icons';

interface RideCardProps {
  ride: RideGroup;
  language: Language;
  onClick: () => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, language, onClick }) => {
  const rideDate = new Date(ride.date);
  const formattedDate = rideDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = rideDate.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const averageRating = useMemo(() => {
    if (ride.rideStatus !== 'Completed' || !ride.ratings || ride.ratings.length === 0) return 0;
    const sum = ride.ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ride.ratings.length).toFixed(1);
  }, [ride.ratings, ride.rideStatus]);

  const statusColors: { [key in RideGroup['rideStatus']]: string } = {
    Upcoming: 'bg-blue-500 text-white',
    Ongoing: 'bg-green-500 text-white',
    Completed: 'bg-gray-600 text-gray-200',
    Cancelled: 'bg-red-500 text-white'
  };


  return (
    <div
      onClick={onClick}
      className="bg-brand-surface rounded-lg p-4 mb-4 shadow-lg cursor-pointer transition-transform transform hover:scale-105 duration-300"
    >
      <h3 className="text-xl font-bold text-brand-primary">{ride.name}</h3>
      <p className="text-brand-text-secondary text-sm">{ride.destination.name}</p>
      <div className="mt-2 text-brand-text text-sm">
        <span>{formattedDate}</span> &middot; <span>{formattedTime}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ride.rideStatus]}`}>
          {ride.rideStatus}
        </span>
        <div className="flex items-center gap-4">
            {ride.rideStatus === 'Completed' && averageRating > 0 && (
                <div className="flex items-center gap-1 text-sm text-yellow-400">
                    <StarIcon className="h-4 w-4" filled={true}/>
                    <span>{averageRating}</span>
                </div>
            )}
            <span className="text-sm text-brand-text-secondary">{ride.participants.length} riders</span>
        </div>
      </div>
    </div>
  );
};