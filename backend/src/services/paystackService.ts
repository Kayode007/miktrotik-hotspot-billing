import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import sessionService from './sessionService';

const prisma = new PrismaClient();

interface InitializeRequest {
  email: string;
  amount: number; // in naira
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

interface InitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

class PaystackService {
  private baseURL = 'https://api.paystack.co';
  private secretKey: string;
  private callbackURL: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY!;
    this.callbackURL = process.env.PAYSTACK_CALLBACK_URL || '';
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };
  }

  async initializeTransaction(request: InitializeRequest): Promise<InitializeResponse> {
    // Mock transaction for development
    if (process.env.NODE_ENV === 'development') {
      return this.simulateInitialize(request);
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email: request.email,
          amount: Math.round(request.amount * 100), // kobo
          reference: request.reference,
          currency: 'NGN',
          callback_url: request.callbackUrl || this.callbackURL || undefined,
          metadata: request.metadata
        },
        { headers: this.headers() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Paystack Initialize Error:', error.response?.data || error.message);
      throw new Error('Failed to initiate Paystack payment');
    }
  }

  async verifyTransaction(reference: string): Promise<any> {
    // Mock verification for development
    if (process.env.NODE_ENV === 'development') {
      return this.simulateVerify(reference);
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: this.headers() }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Paystack Verify Error:', error.response?.data || error.message);
      throw new Error('Failed to verify Paystack payment');
    }
  }

  async handleWebhook(event: any): Promise<void> {
    try {
      if (event.event === 'charge.success') {
        const reference = event.data?.reference;
        if (!reference) return;

        await this.completePayment(reference);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
    }
  }

  /**
   * Marks a payment COMPLETED, stores the reference and provisions
   * a new active session for the customer.
   */
  async completePayment(reference: string): Promise<boolean> {
    const payment = await prisma.payment.findUnique({
      where: { paystackReference: reference },
      include: { user: true, plan: true }
    });

    if (!payment) return false;
    if (payment.status === 'COMPLETED') return true; // already processed

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED' }
    });

    // Create session for the user
    const existingSession = await prisma.session.findFirst({
      where: {
        userId: payment.userId,
        planId: payment.planId,
        status: 'ACTIVE'
      }
    });

    if (!existingSession) {
      const sessionToken = this.generateSessionToken();
      await sessionService.createSession(payment.userId, payment.planId, sessionToken);
    }

    console.log(`💳 Paystack payment completed: ${reference}`);
    return true;
  }

  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // ------- Development mocks -------

  private async simulateInitialize(request: InitializeRequest): Promise<InitializeResponse> {
    const authorizationUrl = `http://localhost:3000/portal?simulated_checkout=${request.reference}`;

    // Simulate successful payment after 10 seconds
    setTimeout(async () => {
      await prisma.payment
        .update({
          where: { paystackReference: request.reference },
          data: { status: 'PENDING' }
        })
        .catch(() => undefined);

      await this.completePayment(request.reference).catch((error) =>
        console.error('Mock payment error:', error)
      );

      console.log(`🎭 Mock Paystack payment completed: ${request.reference}`);
    }, 10000);

    return {
      authorization_url: authorizationUrl,
      access_code: 'mock_access_code_' + Date.now(),
      reference: request.reference
    };
  }

  private async simulateVerify(reference: string): Promise<any> {
    const payment = await prisma.payment.findUnique({
      where: { paystackReference: reference }
    });

    return {
      status: payment?.status === 'COMPLETED' ? 'success' : 'pending',
      reference,
      amount: (payment?.amount ?? 0) * 100,
      currency: 'NGN',
      gateway_response: payment?.status === 'COMPLETED' ? 'Successful' : 'Pending'
    };
  }
}

export default new PaystackService();
