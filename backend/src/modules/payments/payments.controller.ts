import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import db from '../../config/db';

const paymentsService = new PaymentsService();

// Helper to safely get a string param
const qs = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v ?? '');

export class PaymentsController {
  /**
   * POST /api/payments/create-order
   * Create Razorpay order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, consultantId, clientId, amount, currency } = req.body;

      if (!bookingId || !consultantId || !clientId || !amount) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const order = await paymentsService.createOrder(
        bookingId,
        consultantId,
        clientId,
        amount,
        currency || 'INR'
      );

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: `Failed to create order: ${error}` });
    }
  }

  /**
   * POST /api/payments/verify
   * Verify payment
   */
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        res.status(400).json({ error: 'Missing payment details' });
        return;
      }

      const isValid = paymentsService.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        res.status(400).json({ error: 'Invalid payment signature' });
        return;
      }

      // Update payment status to completed via service
      const payment = await paymentsService.updatePaymentAfterVerification(
        razorpayOrderId,
        razorpayPaymentId
      );

      res.json({ message: 'Payment verified successfully', payment });
    } catch (error) {
      res.status(500).json({ error: `Verification failed: ${error}` });
    }
  }

  /**
   * POST /api/payments/webhook
   * Razorpay webhook handler
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
      const signature = req.headers['x-razorpay-signature'];
      const body = JSON.stringify(req.body);

      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }

      const payment = await paymentsService.handlePaymentWebhook(req.body);

      res.json({ message: 'Webhook processed', payment });
    } catch (error) {
      res.status(500).json({ error: `Webhook processing failed: ${error}` });
    }
  }

  /**
   * GET /api/payments/:paymentId
   * Get payment details
   */
  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = qs(req.params['paymentId']);
      const payment = await paymentsService.getPaymentById(paymentId);

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch payment: ${error}` });
    }
  }

  /**
   * GET /api/payments/consultant/:consultantId
   * Get consultant's payments
   */
  async getConsultantPayments(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const status = qs(req.query['status'] as string | string[]);
      const limit = parseInt(qs(req.query['limit'] as string | string[])) || 10;
      const skip = parseInt(qs(req.query['skip'] as string | string[])) || 0;

      const { payments, total } = await paymentsService.getConsultantPayments(
        consultantId,
        status as string,
        limit,
        skip
      );

      res.json({
        payments,
        pagination: { limit, skip, total },
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch payments: ${error}` });
    }
  }

  /**
   * GET /api/payments/consultant/:consultantId/stats
   * Get payment statistics
   */
  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const stats = await paymentsService.getPaymentStats(consultantId);
      const methodStats = await paymentsService.getPaymentMethodStats(consultantId);

      res.json({
        stats,
        methodStats,
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch stats: ${error}` });
    }
  }

  /**
   * POST /api/payments/:paymentId/refund
   * Refund payment
   */
  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = qs(req.params['paymentId']);
      const { refundAmount, refundReason } = req.body;

      const refund = await paymentsService.refundPayment(
        paymentId,
        refundAmount,
        refundReason
      );

      res.json({ message: 'Payment refunded successfully', refund });
    } catch (error) {
      res.status(500).json({ error: `Refund failed: ${error}` });
    }
  }

  /**
   * POST /api/payments/create-listing-order
   * Create Razorpay order for purchasing a product listing
   */
  async createListingOrder(req: Request, res: Response): Promise<void> {
    try {
      const { listingId, amount, currency } = req.body;
      const buyerId = (req as any).user?.userId; // Set by authenticate middleware

      if (!listingId || !amount || !buyerId) {
        res.status(400).json({ error: 'Missing listingId, amount, or buyer details' });
        return;
      }

      // 1. Fetch listing details to verify type is 'sell' and get seller_id (user_id)
      const listingRes = await db.query(
        `SELECT user_id, type FROM public.listings WHERE id = $1 LIMIT 1`,
        [listingId]
      );

      if (listingRes.rows.length === 0) {
        res.status(404).json({ error: 'Marketplace listing not found' });
        return;
      }

      const listing = listingRes.rows[0];
      if (listing.type !== 'sell') {
        res.status(400).json({ error: 'This listing is not available for purchase (must be type: sell)' });
        return;
      }

      const sellerId = listing.user_id;
      if (sellerId === buyerId) {
        res.status(400).json({ error: 'You cannot purchase your own product listing' });
        return;
      }

      // Create Razorpay order
      const order = await paymentsService.createListingOrder(
        listingId,
        sellerId,
        buyerId,
        parseFloat(amount.toString()),
        currency || 'INR'
      );

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating listing order:', error);
      res.status(500).json({ error: `Failed to create listing order: ${(error as Error).message}` });
    }
  }

  /**
   * POST /api/payments/verify-listing-payment
   * Verify listing product payment signature and capture sale
   */
  async verifyListingPayment(req: Request, res: Response): Promise<void> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        res.status(400).json({ error: 'Missing payment details' });
        return;
      }

      const isValid = paymentsService.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        res.status(400).json({ error: 'Invalid payment signature' });
        return;
      }

      // Update payment status to completed
      const payment = await paymentsService.updatePaymentAfterVerification(
        razorpayOrderId,
        razorpayPaymentId
      );

      if (!payment) {
        res.status(404).json({ error: 'Payment record not found for this order ID' });
        return;
      }

      res.json({ message: 'Product purchased successfully', payment });
    } catch (error) {
      console.error('Error verifying listing payment:', error);
      res.status(500).json({ error: `Verification failed: ${(error as Error).message}` });
    }
  }
}