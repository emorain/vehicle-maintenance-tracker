import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { NotificationBell } from './NotificationBell';
import { FeedbackModal } from './FeedbackModal';
import { useState } from 'react';

export const HeaderNav = () => {
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNotificationClick = () => {
    navigate('/');
    // Scroll to reminders section after a short delay to allow navigation
    setTimeout(() => {
      const remindersSection = document.querySelector('[data-reminders]');
      if (remindersSection) {
        remindersSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="bg-upshift-gradient shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top row: Logo/Brand, Notification Bell, and Logout */}
        <div className="flex justify-between items-center py-3 border-b border-white/10">
          {/* Logo and brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#2563eb'}} />
                    <stop offset="100%" style={{stopColor:'#0891b2'}} />
                  </linearGradient>
                </defs>
                <path d="M12 4 L17 10 L15 10 L15 20 L9 20 L9 10 L7 10 Z" fill="url(#logoGradient)"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Upshift</h1>
              <p className="text-xs text-blue-100 hidden sm:block">Vehicle Maintenance Tracker</p>
            </div>
          </Link>

          {/* Notification Bell, Feedback, and Logout button */}
          <div className="flex items-center gap-2">
            <NotificationBell onClick={handleNotificationClick} />
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm flex items-center gap-1.5"
              title="Send Feedback"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="hidden sm:inline">Feedback</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Bottom row: Navigation links */}
        <nav className="flex items-center justify-start gap-1 sm:gap-2 py-2 overflow-x-auto">
          <Link
            to="/"
            className="text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap"
          >
            Dashboard
          </Link>
          <Link
            to="/inventory"
            className="text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap"
          >
            Inventory
          </Link>
          <Link
            to="/bulk-import"
            className="text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap"
          >
            Bulk Import
          </Link>
          <Link
            to="/protocols"
            className="text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap"
          >
            Protocols
          </Link>
        </nav>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </header>
  );
};
