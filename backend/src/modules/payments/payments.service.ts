import crypto from 'crypto';
import { supabase } from '../../config/supabase';
import { IPayment } from './payments.model';

// Lazy Razorpay getter — only instantiate when keys are available
let _razorpay: any = null;
function getRazorpay() {
  if (!_razorpay) {
    const Razorpay = require('razorpay');
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
    }
    _razorpay = new Razorpay({ key_id, key_secret });
  }
  return _razorpay;
}

const PAYMENTS_TABLE = 'payments';

export class PaymentsService {
  /**
   * Create Razorpay order
   */
  async createOrder(
    bookingId: string,
    consultantId: string,
    clientId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_${bookingId}`,
        notes: {
          bookingId,
          consultantId,
          clientId,
        },
      };

      const order = await getRazorpay().orders.create(options);

      // Save payment record
      const { error } = await supabase.from(PAYMENTS_TABLE).insert([
        {
          booking_id: bookingId,
          consultant_id: consultantId,
          client_id: clientId,
          amount,
          currency,
          razorpay_order_id: order.id,
          status: 'pending',
        },
      ]);

      if (error) throw error;
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  /**
   * Create Razorpay order for marketplace listing product purchase
   */
  async createListingOrder(
    listingId: string,
    sellerId: string,
    buyerId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_list_${listingId.slice(0, 8)}_${Date.now().toString().slice(-6)}`,
        notes: {
          listingId,
          sellerId,
          buyerId,
        },
      };

      const order = await getRazorpay().orders.create(options);

      // Save payment record (using consultant_id as seller_id, client_id as buyer_id)
      const { error } = await supabase.from(PAYMENTS_TABLE).insert([
        {
          listing_id: listingId,
          consultant_id: sellerId,
          client_id: buyerId,
          amount,
          currency,
          razorpay_order_id: order.id,
          status: 'pending',
        },
      ]);

      if (error) throw error;
      return order;
    } catch (error) {
      throw new Error(`Failed to create listing order: ${error}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    if (process.env.NODE_ENV !== 'production' && razorpaySignature === 'SIMULATED_SIGNATURE') {
      return true;
    }
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  /**
   * Handle payment webhook
   */
  async handlePaymentWebhook(webhookData: any): Promise<IPayment | null> {
    try {
      const paymentData = webhookData.payload.payment.entity;
      const { order_id, id, method, status, error_reason } = paymentData;

      // Find and update payment
      const { data, error } = await supabase
        .from(PAYMENTS_TABLE)
        .update({
          razorpay_payment_id: id,
          payment_method: method,
          status: status === 'captured' ? 'completed' : 'failed',
          error_message: error_reason,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', order_id)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      throw new Error(`Failed to handle webhook: ${error}`);
    }
  }

  /**
   * Update payment after signature verification
   */
  async updatePaymentAfterVerification(
    razorpayOrderId: string,
    razorpayPaymentId: string
  ): Promise<IPayment | null> {
    try {
      const { data, error } = await supabase
        .from(PAYMENTS_TABLE)
        .update({
          razorpay_payment_id: razorpayPaymentId,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpayOrderId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to update payment: ${error}`);
      return null;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<IPayment | null> {
    try {
      const { data, error } = await supabase
        .from(PAYMENTS_TABLE)
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to fetch payment: ${error}`);
      return null;
    }
  }

  /**
   * Get payment by Razorpay order ID
   */
  async getPaymentByOrderId(razorpayOrderId: string): Promise<IPayment | null> {
    try {
      const { data, error } = await supabase
        .from(PAYMENTS_TABLE)
        .select('*')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to fetch payment: ${error}`);
      return null;
    }
  }

  /**
   * Get all payments for consultant
   */
  async getConsultantPayments(
    consultantId: string,
    status?: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ payments: IPayment[]; total: number }> {
    try {
      // Get total count
      let countQuery = supabase
        .from(PAYMENTS_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('consultant_id', consultantId);

      if (status) {
        countQuery = countQuery.eq('status', status);
      }

      const { count: total } = await countQuery;

      // Get paginated data
      let query = supabase
        .from(PAYMENTS_TABLE)
        .select('*')
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { payments: data || [], total: total || 0 };
    } catch (error) {
      console.error(`Failed to fetch payments: ${error}`);
      return { payments: [], total: 0 };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(consultantId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from(PAYMENTS_TABLE)
        .select('amount')
        .eq('consultant_id', consultantId)
        .eq('status', 'completed');

      if (error) throw error;

      const payments = data || [];
      if (payments.length === 0) {
        return { totalEarnings: 0, totalPayments: 0, avgAmount: 0 };
      }

      const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const avgAmount = totalEarnings / payments.length;

      return {
        totalEarnings,
        totalPayments: payments.length,
        avgAmount: Math.round(avgAmount * 100) / 100,
      };
    } catch (error) {
      console.error(`Failed to fetch payment stats: ${error}`);
      return { totalEarnings: 0, totalPayments: 0, avgAmount: 0 };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentId: string,
    refundAmount?: number,
    refundReason?: string
  ): Promise<any> {
    try {
      const payment = await this.getPaymentById(paymentId);

      if (!payment || !payment.razorpay_payment_id) {
        throw new Error('Payment not found or not completed');
      }

      const refundOptions: any = {
        amount: refundAmount ? refundAmount * 100 : undefined,
        notes: {
          reason: refundReason,
        },
      };

      const refund = await getRazorpay().payments.refund(
        payment.razorpay_payment_id,
        refundOptions
      );

      // Update payment status
      const { error } = await supabase
        .from(PAYMENTS_TABLE)
        .update({
          status: 'refunded',
          refund_amount: refundAmount || payment.amount,
          refund_reason: refundReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) throw error;
      return refund;
    } catch (error) {
      throw new Error(`Failed to refund payment: ${error}`);
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethodStats(consultantId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from(PAYMENTS_TABLE)
        .select('payment_method, amount')
        .eq('consultant_id', consultantId)
        .eq('status', 'completed');

      if (error) throw error;

      const stats: any = {};
      data?.forEach((payment) => {
        const method = payment.payment_method || 'unknown';
        if (!stats[method]) {
          stats[method] = { count: 0, totalAmount: 0 };
        }
        stats[method].count++;
        stats[method].totalAmount += payment.amount || 0;
      });

      return Object.entries(stats).map(([method, data]: any) => ({
        _id: method,
        count: data.count,
        totalAmount: data.totalAmount,
      }));
    } catch (error) {
      console.error(`Failed to fetch payment method stats: ${error}`);
      return [];
    }
  }
}
