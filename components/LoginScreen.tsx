import React from 'react';
import { User, Language } from '../types';
import { translations } from '../constants';
import { PowersportIcon } from './icons';

interface LoginScreenProps {
  users: User[];
  language: Language;
  onLogin: (userId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, language, onLogin }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-16">
        <PowersportIcon className="h-20 w-20 text-brand-primary" />
        <h1 className="text-3xl font-bold mt-4 mb-2 text-center">{t.appName}</h1>
        <h2 className="text-xl text-brand-text-secondary mb-8 text-center">{t.loginTitle}</h2>
        <div className="w-full max-w-sm space-y-4">
            {users.map(user => (
                <div key={user.id} className="bg-brand-surface p-4 rounded-lg shadow-lg flex items-center gap-4">
                    <img src={user.photo} alt={user.name} className="h-16 w-16 rounded-full object-cover border-2 border-brand-secondary" />
                    <div className="flex-grow">
                        <p className="text-lg font-semibold">{user.name}</p>
                        <p className="text-sm text-brand-text-secondary">{user.preferredRideType}</p>
                    </div>
                    <button 
                        onClick={() => onLogin(user.id)}
                        className="bg-brand-primary text-gray-900 font-bold py-2 px-4 rounded-full shadow-md hover:bg-brand-primary-hover transition-transform transform hover:scale-105"
                    >
                        {t.loginAs}
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default LoginScreen;