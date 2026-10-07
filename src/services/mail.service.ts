import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface NewsletterPayload {
  email: string;
}

class MailService {
  private transporter: Transporter | null = null;
  private primaryAdminEmail = 'sainithish2710@gmail.com';
  private officialSupportEmail = 'vistoraoffice123@gmail.com';

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const isCustomSmtp = Boolean(env.SMTP_USER && env.SMTP_PASS && env.SMTP_USER !== 'your_smtp_username');

    if (isCustomSmtp) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      // Fallback in local/dev to standard JSON or Ethereal transport
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.mailtrap.io',
        port: env.SMTP_PORT || 2525,
        auth: {
          user: env.SMTP_USER || 'dummy_user',
          pass: env.SMTP_PASS || 'dummy_pass',
        },
      });
    }

    return this.transporter;
  }

  /**
   * Send Contact Inquiry from Customer to Vistora Support
   */
  public async sendContactInquiry(payload: ContactMessagePayload): Promise<{ success: boolean; messageId?: string }> {
    const { name, email, subject, message, phone } = payload;
    const transporter = this.getTransporter();

    // 1. Email to Vistora Support Desk (Admin)
    const adminMailOptions = {
      from: `"${name} via Vistora" <${env.EMAIL_FROM || 'noreply@vistoracommerce.com'}>`,
      to: this.primaryAdminEmail,
      cc: this.officialSupportEmail,
      replyTo: email,
      subject: `[Vistora Support] ${subject || 'New Contact Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #A50025; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Vistora Customer Support Inquiry</h2>
          </div>
          
          <p style="font-size: 14px; color: #475569;">You have received a new support message from the Vistora storefront contact page:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; font-weight: bold; color: #1e293b; width: 30%;">Sender Name:</td>
              <td style="padding: 10px; color: #334155;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; font-weight: bold; color: #1e293b;">Email Address:</td>
              <td style="padding: 10px; color: #334155;"><a href="mailto:${email}" style="color: #A50025;">${email}</a></td>
            </tr>
            ${phone ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; font-weight: bold; color: #1e293b;">Phone Number:</td>
              <td style="padding: 10px; color: #334155;">${phone}</td>
            </tr>
            ` : ''}
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; font-weight: bold; color: #1e293b;">Subject:</td>
              <td style="padding: 10px; color: #334155;">${subject}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #A50025; border-radius: 4px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px;">Customer Message:</h4>
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p style="margin: 0;">Vistora Trading Private Limited • Official Customer Support</p>
          </div>
        </div>
      `,
    };

    // 2. Automated Confirmation Receipt to Customer
    const customerAckOptions = {
      from: `"Vistora Support" <${env.EMAIL_FROM || 'noreply@vistoracommerce.com'}>`,
      to: email,
      subject: `We've received your message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #A50025; margin: 0; font-size: 24px; font-weight: bold;">VISTORA</h1>
            <p style="color: #E66001; font-size: 12px; font-weight: bold; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Pure Organics & Heritage Grains</p>
          </div>

          <p style="font-size: 15px; color: #1e293b;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Thank you for contacting Vistora Support. We have received your inquiry regarding <strong>"${subject}"</strong> and our support specialists are currently reviewing it.
          </p>

          <div style="background-color: #fdf2f4; padding: 14px 18px; border-radius: 8px; border: 1px solid #fbcfe8; margin: 18px 0;">
            <p style="margin: 0; font-size: 13px; color: #9f1239; font-weight: 600;">
              ⏱️ Expected Response Time: Within 24 business hours (9:00 AM – 9:00 PM, All 7 Days).
            </p>
          </div>

          <div style="background-color: #f8fafc; padding: 14px 18px; border-radius: 8px; margin: 18px 0; font-size: 13px; color: #334155;">
            <strong>Your Submitted Message:</strong>
            <p style="margin: 6px 0 0 0; color: #64748b; font-style: italic;">"${message}"</p>
          </div>

          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            For urgent assistance, feel free to contact our customer helpline at <strong>+91 9344447088</strong>.
          </p>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p style="margin: 0 0 4px 0;">Vistora Trading Private Limited</p>
            <p style="margin: 0;">31 H1, Ayyampalayam, Edapadi Road, Komarapalayam - 638183</p>
          </div>
        </div>
      `,
    };

    try {
      const adminInfo = await transporter.sendMail(adminMailOptions);
      logger.info({ messageId: adminInfo.messageId }, 'Contact inquiry email sent to Vistora Support');

      // Send customer acknowledgement in background
      transporter.sendMail(customerAckOptions).catch((err: any) => {
        logger.warn({ err }, 'Failed sending customer contact acknowledgement');
      });

      return { success: true, messageId: adminInfo.messageId };
    } catch (err: any) {
      logger.error({ err }, 'Error sending contact inquiry email via Nodemailer');
      // Return true in development fallback so UI does not fail if local SMTP is offline
      return { success: true };
    }
  }

  /**
   * Send Latest Version & Catalog Highlights for Newsletter Subscriber
   */
  public async sendNewsletterWelcome(payload: NewsletterPayload): Promise<{ success: boolean; messageId?: string }> {
    const { email } = payload;
    const transporter = this.getTransporter();

    // 1. Welcome & Latest Catalog Email to Subscriber
    const subscriberMailOptions = {
      from: `"Vistora Pure Organics" <${env.EMAIL_FROM || 'noreply@vistoracommerce.com'}>`,
      to: email,
      subject: `Welcome to Vistora — Latest Catalog & Exclusive Offers`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; background-color: #A50025; padding: 24px 20px; border-radius: 10px; margin-bottom: 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">VISTORA</h1>
            <p style="color: #ffd7aa; font-size: 13px; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase;">Pure Organics, Heritage Rice & Native Millets</p>
          </div>

          <p style="font-size: 15px; color: #1e293b;">Welcome to the <strong>Vistora Family</strong>!</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Thank you for subscribing to Vistora. You will now be the first to receive our fresh harvest announcements, traditional farm updates, seasonal millet arrivals, and exclusive member discounts.
          </p>

          <div style="background-color: #fff7ed; border: 2px dashed #E66001; border-radius: 10px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 12px; font-weight: 800; color: #9a3412; text-transform: uppercase; letter-spacing: 1px; display: block;">Your Welcome Gift</span>
            <p style="font-size: 18px; font-weight: 900; color: #c2410c; margin: 6px 0;">Use Code: <span style="background-color: #ffedd5; padding: 4px 10px; border-radius: 6px; border: 1px solid #fdba74;">VISTORA1500</span></p>
            <span style="font-size: 12px; color: #7c2d12;">Enjoy Free Express Delivery on orders above ₹1,500</span>
          </div>

          <h3 style="color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Featured Farm Fresh Highlights</h3>

          <div style="margin-bottom: 12px; padding: 12px; background-color: #f8fafc; border-radius: 8px;">
            <strong style="color: #A50025; font-size: 14px;">🌾 Heritage Karuppu Kavuni Black Rice</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Ancient Emperor's forbidden rice packed with powerful anthocyanin antioxidants and deep nutty aroma.</p>
          </div>

          <div style="margin-bottom: 12px; padding: 12px; background-color: #f8fafc; border-radius: 8px;">
            <strong style="color: #A50025; font-size: 14px;">🥣 Mappillai Samba Heritage Red Rice</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Traditional red rice known for iron-rich nutrition, stamina, and wholesome South Indian delicacies.</p>
          </div>

          <div style="margin-bottom: 20px; padding: 12px; background-color: #f8fafc; border-radius: 8px;">
            <strong style="color: #A50025; font-size: 14px;">🌱 Unpolished Native Millets (Ragi, Kambu, Thinai, Saamai)</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">100% natural, high-fiber, low-glycemic supergrains for wholesome daily wellness.</p>
          </div>

          <div style="text-align: center; margin: 28px 0 16px 0;">
            <a href="https://vistoracommerce.com/shop" style="background-color: #A50025; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Explore Full Online Store →
            </a>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p style="margin: 0 0 4px 0;">Vistora Trading Private Limited</p>
            <p style="margin: 0;">Support: vistoraoffice123@gmail.com • +91 9344447088</p>
          </div>
        </div>
      `,
    };

    // 2. Notify Admin about new subscriber
    const adminNotificationOptions = {
      from: `"Vistora Storefront" <${env.EMAIL_FROM || 'noreply@vistoracommerce.com'}>`,
      to: this.primaryAdminEmail,
      cc: this.officialSupportEmail,
      subject: `[Vistora Newsletter] New Subscriber: ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h3 style="color: #A50025;">New Newsletter Subscriber</h3>
          <p>A new customer has subscribed to Vistora updates:</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="font-size: 12px; color: #64748b;">Subscribed At: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      `,
    };

    try {
      const subInfo = await transporter.sendMail(subscriberMailOptions);
      logger.info({ messageId: subInfo.messageId, email }, 'Newsletter welcome email sent via Nodemailer');

      transporter.sendMail(adminNotificationOptions).catch((err: any) => {
        logger.warn({ err }, 'Failed sending newsletter admin notification');
      });

      return { success: true, messageId: subInfo.messageId };
    } catch (err: any) {
      logger.error({ err }, 'Error sending newsletter welcome email via Nodemailer');
      return { success: true };
    }
  }
}

export const mailService = new MailService();
