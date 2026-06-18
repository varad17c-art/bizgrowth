import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        bookingId: booking.id,
        consultantId: booking.consultant_id,
        clientId: user.id,
        rating,
        title: title.trim() || `${rating}-Star Review`,
        comment: comment.trim()
      };

      const data = await api.post('/api/reviews', payload);
      if (data && data.id) {
        onSuccess(data);
      } else {
        throw new Error('Could not submit review.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in">
      <form 
        onSubmit={handleSubmit}
        className="bg-surface border border-outline-variant/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col premium-glass-card"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-primary font-bold">Write a Review</h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-3 rounded-xl text-body-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}

          {/* Star Selector */}
          <div className="text-center space-y-2">
            <label className="block text-body-sm font-bold text-primary">How was your session?</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-tertiary hover:scale-110 active:scale-95 transition-all duration-150 p-1"
                  >
                    <span 
                      className={`material-symbols-outlined text-4xl ${isActive ? 'icon-fill' : ''}`}
                    >
                      star
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[13px] text-on-surface-variant font-semibold">
              {rating === 5 && 'Excellent - Highly Recommended'}
              {rating === 4 && 'Very Good - Helpful Session'}
              {rating === 3 && 'Good - Average Session'}
              {rating === 2 && 'Fair - Could be improved'}
              {rating === 1 && 'Poor - Unsatisfactory'}
            </p>
          </div>

          {/* Review Title */}
          <div>
            <label htmlFor="review-title" className="block text-body-sm font-bold text-primary mb-2">
              Review Title
            </label>
            <input
              id="review-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Extremely helpful session!, Great insights"
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Review Comment */}
          <div>
            <label htmlFor="review-comment" className="block text-body-sm font-bold text-primary mb-2">
              Written Review
            </label>
            <textarea
              id="review-comment"
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your experience with this consultant..."
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-outline text-primary hover:bg-surface-container-high px-5 py-2.5 rounded-full font-semibold text-body-sm transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-full font-semibold text-body-sm transition-all duration-300 shadow-md flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
