import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProductPaymentModal({ listing, amount, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    if (simulationMode || !keyId) {
      setSimulationMode(true);
      setLoading(false);
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay payment gateway SDK. Entering simulation mode.');
        setSimulationMode(true);
        setLoading(false);
        return;
      }

      // 1. Create order on backend
      const order = await api.post('/api/payments/create-listing-order', {
        listingId: listing.id,
        amount: Math.round(amount),
        currency: listing.currency || 'INR'
      });

      if (!order || !order.id) {
        throw new Error('Failed to create order on payment server.');
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'BizGrowth Marketplace',
        description: `Purchase: ${listing.title}`,
        order_id: order.id,
        handler: async (response) => {
          setLoading(true);
          try {
            // 3. Verify signature on backend
            const result = await api.post('/api/payments/verify-listing-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (result && result.payment) {
              onSuccess(result.payment);
            } else {
              throw new Error('Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError(err.message || 'Verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#2c57c1', // secondary theme color
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Checkout crash:', err);
      setError('Payment gateway error. Switching to testing/simulation checkout.');
      setSimulationMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (status) => {
    setSimulationLoading(true);
    setError('');
    try {
      if (status === 'fail') {
        throw new Error('Simulated transaction failed.');
      }

      // 1. Create order
      const order = await api.post('/api/payments/create-listing-order', {
        listingId: listing.id,
        amount: Math.round(amount),
        currency: listing.currency || 'INR'
      });

      // 2. Verify order using bypass signature
      const result = await api.post('/api/payments/verify-listing-payment', {
        razorpayOrderId: order.id,
        razorpayPaymentId: 'pay_sim_' + Math.random().toString(36).substring(7),
        razorpaySignature: 'SIMULATED_SIGNATURE'
      });

      if (result && result.payment) {
        onSuccess(result.payment);
      } else {
        throw new Error('Simulated payment verification failed.');
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed.');
    } finally {
      setSimulationLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-outline-variant/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col premium-glass-card">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-primary font-bold">Secure Checkout</h3>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          {error && (
            <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-3 rounded-xl text-body-sm font-semibold flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <span className="material-symbols-outlined text-5xl text-secondary animate-pulse">shopping_cart</span>
            <h4 className="text-body-lg font-bold text-primary">Confirm Purchase</h4>
            <p className="text-body-sm text-on-surface-variant max-w-xs mx-auto">
              You are purchasing listing product: <strong>{listing.title}</strong> from seller.
            </p>
          </div>

          <div className="bg-surface-container border border-outline-variant/30 p-4 rounded-xl flex justify-between items-center">
            <span className="text-body-sm text-on-surface-variant font-semibold">Total Price</span>
            <span className="font-headline-md text-headline-md font-bold text-secondary">{listing.currency || 'INR'} {amount}</span>
          </div>

          {simulationMode ? (
            <div className="bg-tertiary-container/10 border border-tertiary/20 p-4 rounded-xl space-y-3 text-left animate-fade-in">
              <div className="flex items-center gap-2 text-tertiary font-bold text-body-sm">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                Testing Checkout Simulator
              </div>
              <p className="text-body-sm text-on-surface-variant">
                We've opened testing mode. You can simulate a successful or failed checkout transaction here.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleSimulatePayment('success')}
                  disabled={simulationLoading}
                  className="bg-primary text-on-primary font-bold text-body-sm py-2.5 rounded-full hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {simulationLoading ? 'Processing...' : 'Simulate Success'}
                </button>
                <button
                  onClick={() => handleSimulatePayment('fail')}
                  disabled={simulationLoading}
                  className="border border-error text-error font-bold text-body-sm py-2.5 rounded-full hover:bg-error/10 transition-all flex items-center justify-center"
                >
                  Simulate Failure
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary text-on-primary font-headline-sm text-body-md py-3 rounded-full hover:bg-primary/95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                    Securing Order...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    Pay via Razorpay
                  </>
                )}
              </button>
              <button
                onClick={() => setSimulationMode(true)}
                className="text-body-sm text-secondary hover:underline font-semibold"
              >
                Use Checkout Simulator (Testing)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
