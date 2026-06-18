import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function BookingFlowModal({ consultantId, consultantName, service, onClose, onSuccess }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Generate 7 days starting from today
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError('');
      setSelectedSlot(null);
      try {
        const fromDate = new Date(selectedDate);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(selectedDate);
        toDate.setHours(23, 59, 59, 999);

        const duration = service?.duration || 60;

        // GET /api/availability/:consultantId/available-slots
        const data = await api.get(
          `/api/availability/${consultantId}/available-slots?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}&durationMinutes=${duration}`
        );
        
        if (data && data.slots) {
          // Parse slot ISO strings to Date objects
          const parsed = data.slots.map(s => new Date(s));
          // Filter slots that are in the past
          const now = new Date();
          const validSlots = parsed.filter(s => s > now);
          setAvailableSlots(validSlots);
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError('Failed to fetch available slots.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [consultantId, selectedDate, service]);

  const handleSubmit = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    if (!user) {
      setError('You must be logged in to book a session.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const duration = service?.duration || 60;
      
      const payload = {
        consultantId,
        clientId: user.id,
        scheduledAt: selectedSlot.toISOString(),
        durationMinutes: duration,
        notes: notes.trim() || `Consultation for ${service?.name || 'General Business Inquiry'}`
      };

      const booking = await api.post('/api/bookings', payload);
      
      if (booking && booking.id) {
        onSuccess(booking);
      } else {
        throw new Error('Booking response was invalid.');
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-outline-variant/30 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col premium-glass-card max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
          <div>
            <h3 className="font-headline-md text-headline-md text-primary font-bold">Book a Session</h3>
            <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">
              with {consultantName} • {service?.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {error && (
            <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-3 rounded-xl text-body-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}

          {/* Date Selector */}
          <div>
            <label className="block text-body-sm font-bold text-primary mb-3">Select a Date</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {dateOptions.map((date) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();
                const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-16 py-3 rounded-xl transition-all duration-300 font-semibold border ${
                      isSelected
                        ? 'bg-secondary text-white border-secondary shadow-md scale-105'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-primary'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider opacity-80">{dayName}</span>
                    <span className="text-lg font-bold my-0.5">{dayNum}</span>
                    <span className="text-[10px] opacity-75">{monthName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Selector */}
          <div>
            <label className="block text-body-sm font-bold text-primary mb-3">
              Available Times
            </label>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8 gap-2 text-on-surface-variant">
                <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-body-sm">Loading slots...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40">
                <span className="material-symbols-outlined text-4xl opacity-50 mb-1">event_busy</span>
                <p className="text-body-sm font-medium">No slots available for this day.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot && slot.getTime() === selectedSlot.getTime();
                  const timeString = slot.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });
                  return (
                    <button
                      key={slot.toISOString()}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl border text-body-sm font-semibold transition-all duration-300 ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-sm scale-[1.02]'
                          : 'bg-surface-container-low text-primary border-outline-variant/30 hover:bg-surface-container hover:border-primary/50'
                      }`}
                    >
                      {timeString}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes Form */}
          <div>
            <label htmlFor="booking-notes" className="block text-body-sm font-bold text-primary mb-2">
              Add Notes (Optional)
            </label>
            <textarea
              id="booking-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell the consultant about what you want to discuss..."
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
            type="button"
            disabled={!selectedSlot || submitting || loadingSlots}
            onClick={handleSubmit}
            className="bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-full font-semibold text-body-sm transition-all duration-300 shadow-md flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
