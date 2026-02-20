import axios from 'axios';

export const webhookService = {
  async sendStatusUpdate(url: string, payload: any) {
    try {
      await axios.post(url, payload);
    } catch (error) {
      console.error('Failed to send webhook:', error);
      // We don't throw here to avoid failing the job just because the webhook failed
    }
  }
};
