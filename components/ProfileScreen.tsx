import React from 'react';
import { User, Language } from '../types';
import { translations } from '../constants';

interface ProfileScreenProps {
  user: User;
  language: Language;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, language, onLogout }) => {
  const t = translations[language];

  const ProfileField: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="py-3">
        <p className="text-sm text-brand-text-secondary">{label}</p>
        {value && <p className="text-lg text-brand-text">{value}</p>}
        {children}
    </div>
  );

  return (
    <div className="p-4 pt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">{t.myProfile}</h1>
      <div className="flex flex-col items-center">
        <img src={user.photo} alt={user.name} className="h-32 w-32 rounded-full object-cover border-4 border-brand-primary shadow-lg" />
        <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
      </div>
      <div className="mt-8 bg-brand-surface rounded-lg p-4 shadow-lg divide-y divide-gray-700">
        <ProfileField label={t.email} value={user.email} />
        <ProfileField label={t.phone} value={user.phone} />
        <ProfileField label={t.preferredVehicle} value={user.preferredRideType} />
        <ProfileField label={t.emergencyContact}>
            {user.emergencyContact ? (
                <p className="text-lg text-brand-text">{user.emergencyContact.name} ({user.emergencyContact.phone})</p>
            ) : (
                <p className="text-lg text-brand-text-secondary">{t.noEmergencyContact}</p>
            )}
        </ProfileField>
      </div>
      <div className="mt-8">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 text-white font-bold py-3 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105 duration-300"
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;