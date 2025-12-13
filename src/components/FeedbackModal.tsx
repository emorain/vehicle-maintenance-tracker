import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from './Toast';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_TYPES = [
  {
    value: 'bug' as FeedbackType,
    label: 'Bug Report',
    description: 'Something is broken or not working correctly',
    icon: '🐛',
    color: 'bg-red-50 border-red-200 text-red-600'
  },
  {
    value: 'feature' as FeedbackType,
    label: 'Feature Request',
    description: 'Suggest a new feature or capability',
    icon: '💡',
    color: 'bg-blue-50 border-blue-200 text-blue-600'
  },
  {
    value: 'improvement' as FeedbackType,
    label: 'Improvement',
    description: 'Suggest an enhancement to existing functionality',
    icon: '✨',
    color: 'bg-purple-50 border-purple-200 text-purple-600'
  },
  {
    value: 'other' as FeedbackType,
    label: 'Other',
    description: 'General feedback or questions',
    icon: '💬',
    color: 'bg-gray-50 border-gray-200 text-gray-600'
  }
];

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setToast({ message: 'You must be logged in to submit feedback', type: 'error' });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        type,
        title: title.trim(),
        description: description.trim(),
        page_url: window.location.href
      });

      if (error) throw error;

      setToast({ message: 'Feedback submitted successfully! Thank you for your input.', type: 'success' });
      setTitle('');
      setDescription('');
      setType('bug');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setToast({ message: 'Failed to submit feedback. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setType('bug');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal Content */}
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Send Feedback</h2>
              <p className="text-sm text-gray-600 mt-1">
                Help us improve by reporting bugs, suggesting features, or sharing your thoughts.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Feedback Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What type of feedback?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEEDBACK_TYPES.map((feedbackType) => {
                  const isSelected = type === feedbackType.value;

                  return (
                    <button
                      key={feedbackType.value}
                      type="button"
                      onClick={() => setType(feedbackType.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? feedbackType.color + ' border-current shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{feedbackType.icon}</span>
                        <div className="flex-1">
                          <div className={`font-semibold ${isSelected ? '' : 'text-gray-900'}`}>
                            {feedbackType.label}
                          </div>
                          <div className={`text-xs mt-1 ${isSelected ? 'opacity-75' : 'text-gray-500'}`}>
                            {feedbackType.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="feedback-title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="feedback-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? 'e.g., Cannot save maintenance records'
                    : type === 'feature'
                    ? 'e.g., Add service reminder notifications'
                    : 'Brief summary of your feedback'
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="feedback-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="feedback-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? 'Please describe what happened, what you expected, and steps to reproduce the issue...'
                    : type === 'feature'
                    ? 'Please describe the feature you would like to see and how it would help you...'
                    : 'Please provide as much detail as possible...'
                }
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Current page: {window.location.pathname}
              </p>
            </div>

            {/* Modal Footer with Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
