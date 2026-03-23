import twilio from 'twilio';
import { Resend } from 'resend';
import { config } from '../config';
import { logger } from '../lib/logger';

interface BookingNotificationData {
  id: string;
  customerName: string;
  customerEmail: string;
  roomName: string;
  roomType: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
}

const twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function sendWhatsApp(data: BookingNotificationData): Promise<void> {
  const body = [
    '🏨 *New Booking — RoyalSuits Hotel*',
    '',
    `Booking ID: ${data.id}`,
    `Guest: ${data.customerName}`,
    `Room: ${data.roomName} (${data.roomType})`,
    `Check-in: ${formatDate(data.checkIn)}`,
    `Check-out: ${formatDate(data.checkOut)}`,
    `Total: $${data.totalPrice.toFixed(2)}`,
  ].join('\n');

  await twilioClient.messages.create({
    from: config.TWILIO_WHATSAPP_FROM,
    to: config.HOTEL_WHATSAPP_NUMBER,
    body,
  });
}

async function sendEmail(data: BookingNotificationData): Promise<void> {
  if (!config.RESEND_API_KEY) return;

  const resend = new Resend(config.RESEND_API_KEY);

  await resend.emails.send({
    from: 'bookings@royalsuitshotel.com',
    to: data.customerEmail,
    subject: `Booking Confirmed — ${data.roomName} | RoyalSuits Hotel`,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Dear ${data.customerName},</p>
      <p>Your booking at RoyalSuits Hotel has been confirmed.</p>
      <table>
        <tr><td><strong>Booking ID:</strong></td><td>${data.id}</td></tr>
        <tr><td><strong>Room:</strong></td><td>${data.roomName} (${data.roomType})</td></tr>
        <tr><td><strong>Check-in:</strong></td><td>${formatDate(data.checkIn)}</td></tr>
        <tr><td><strong>Check-out:</strong></td><td>${formatDate(data.checkOut)}</td></tr>
        <tr><td><strong>Total:</strong></td><td>$${data.totalPrice.toFixed(2)}</td></tr>
      </table>
      <p>We look forward to welcoming you.</p>
    `,
  });
}

export function sendBookingNotification(data: BookingNotificationData): void {
  sendWhatsApp(data).catch((err: unknown) => {
    logger.error({ err, bookingId: data.id }, 'WhatsApp notification failed');
  });

  if (config.RESEND_API_KEY) {
    sendEmail(data).catch((err: unknown) => {
      logger.error({ err, bookingId: data.id }, 'Email notification failed');
    });
  }
}
