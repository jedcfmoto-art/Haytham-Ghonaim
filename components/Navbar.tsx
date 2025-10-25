
import React from 'react';
import { Page, Language } from '../types';
import { translations } from '../constants';
import { HomeIcon, PowersportIcon, PlusCircleIcon, ChatBubbleIcon, UserCircleIcon } from './icons';

interface NavbarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  language: Language;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, language }) => {
  const t = translations[language];

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'Home', label: t.navHome, icon: <HomeIcon className="h-6 w-6" /> },
    { page: 'My Rides', label: t.navMyRides, icon: <PowersportIcon className="h-6 w-6" /> },
    { page: 'Create Ride', label: t.navCreateRide, icon: <PlusCircleIcon className="h-8 w-8 text-brand-primary" /> },
    { page: 'Chat', label: t.navChat, icon: <ChatBubbleIcon className="h-6 w-6" /> },
    { page: 'Profile', label: t.navProfile, icon: <UserCircleIcon className="h-6 w-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-surface border-t border-gray-700 shadow-lg">
      <div className="flex justify-around items-center max-w-lg mx-auto h-20">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
              activePage === item.page ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            {item.icon}
            {item.page !== 'Create Ride' && <span className="text-xs mt-1">{item.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;