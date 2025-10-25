import React, { useState } from 'react';
import { Language, RideGroup, DestinationInfo } from '../types';
import { translations } from '../constants';
import { findRideDestination } from '../services/geminiService';
import { MapPinIcon } from './icons';

interface CreateRideScreenProps {
  language: Language;
  currentUserId: string;
  onCreateRide: (ride: Omit<RideGroup, 'id' | 'participants' | 'rideStatus' | 'ratings' | 'distance' | 'duration' >) => void;
}

const CreateRideScreen: React.FC<CreateRideScreenProps> = ({ language, currentUserId, onCreateRide }) => {
  const t = translations[language];
  const [rideName, setRideName] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationInfo, setDestinationInfo] = useState<DestinationInfo | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [reminder, setReminder] = useState<"none" | "1h" | "24h">('1h');
  const [isFinding, setIsFinding] = useState(false);
  const [error, setError] = useState('');

  const handleFindDestination = async () => {
    if (!destinationQuery) return;
    setIsFinding(true);
    setError('');
    setDestinationInfo(null);
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const result = await findRideDestination(destinationQuery, { latitude, longitude });
          setDestinationInfo(result);
          setDescription(result.description);
          setIsFinding(false);
        },
        (geoError) => {
          console.error("Geolocation error:", geoError);
          setError("Could not get location. Please enable location services.");
          setIsFinding(false);
        }
      );
    } catch (apiError: any) {
      setError(apiError.message || "An error occurred.");
      setIsFinding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rideName || !destinationInfo || !date || !time) {
      setError("Please fill all required fields and find a destination.");
      return;
    }
    const rideDateTime = new Date(`${date}T${time}`);
    onCreateRide({
      name: rideName,
      date: rideDateTime.toISOString(),
      description,
      destination: {
        name: destinationInfo.name,
        mapsLink: destinationInfo.mapsLink
      },
      createdBy: currentUserId,
      reminder,
    });
  };

  return (
    <div className="p-4 pt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">{t.createRideTitle}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary">{t.rideName}</label>
          <input type="text" value={rideName} onChange={e => setRideName(e.target.value)} placeholder={t.rideNamePlaceholder} required className="w-full bg-brand-surface p-2 mt-1 rounded-md border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary">{t.destination}</label>
          <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
            <input type="text" value={destinationQuery} onChange={e => setDestinationQuery(e.target.value)} placeholder={t.destinationPlaceholder} className="flex-grow bg-brand-surface p-2 rounded-md border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
            <button type="button" onClick={handleFindDestination} disabled={isFinding} className="bg-brand-secondary text-white font-semibold px-4 py-2 rounded-md disabled:bg-gray-500">
              {isFinding ? t.finding : t.findDestination}
            </button>
          </div>
        </div>

        {destinationInfo && (
            <div className="bg-brand-surface p-3 rounded-md border border-green-500 space-y-3">
            <div>
                <p className="font-semibold text-brand-primary">{destinationInfo.name}</p>
                <p className="text-sm text-brand-text-secondary mt-1">{description}</p>
            </div>
            <div className="h-48 rounded-md overflow-hidden bg-gray-700">
                <iframe
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(destinationInfo.name)}&output=embed`}
                    title={`Map of ${destinationInfo.name}`}
                >
                </iframe>
            </div>
            <a href={destinationInfo.mapsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center justify-end">
              {t.viewOnMap} <MapPinIcon className="h-4 w-4 ms-1" />
            </a>
          </div>
        )}

        <div className="flex space-x-4 rtl:space-x-reverse">
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-text-secondary">{t.rideDate}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-brand-surface p-2 mt-1 rounded-md border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-text-secondary">{t.rideTime}</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full bg-brand-surface p-2 mt-1 rounded-md border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-brand-text-secondary">{t.reminder}</label>
            <select value={reminder} onChange={e => setReminder(e.target.value as any)} className="w-full bg-brand-surface p-2 mt-1 rounded-md border border-gray-600 focus:ring-brand-primary focus:border-brand-primary">
                <option value="1h">{t.reminder1h}</option>
                <option value="24h">{t.reminder24h}</option>
                <option value="none">{t.reminderNone}</option>
            </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-secondary">{t.description}</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t.descriptionPlaceholder} rows={3} className="w-full bg-brand-surface p-2 mt-1 rounded-md border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button type="submit" className="w-full bg-brand-primary text-gray-900 font-bold py-3 rounded-full shadow-lg hover:bg-brand-primary-hover transition-transform transform hover:scale-105 duration-300 disabled:bg-gray-600" disabled={isFinding}>
          {t.createRideButton}
        </button>
      </form>
    </div>
  );
};

export default CreateRideScreen;