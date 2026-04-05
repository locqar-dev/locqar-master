import axios from 'axios';
import { logger } from '../utils/logger';

export class SmsService {
  static async send(to: string, message: string): Promise<boolean> {
    try {
      const clientId = process.env.HUBTEL_CLIENT_ID;
      const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        logger.warn(`Hubtel credentials missing, simulating SMS to ${to}: ${message}`);
        return true;
      }
      
      const payload = {
        From: process.env.HUBTEL_SENDER_ID || 'LocQar',
        To: to,
        Content: message,
      };
      
      const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
      
      await axios.post('https://smsc.hubtel.com/v1/messages/send', payload, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
      });
      
      logger.info(`SMS sent successfully via Hubtel to ${to}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to send Hubtel SMS to ${to}:`, error.response?.data || error.message);
      return false;
    }
  }
}
