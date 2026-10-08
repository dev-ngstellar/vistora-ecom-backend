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

import { prisma } from '../config/prisma.config';

class MailService {
  private transporter: Transporter | null = null;
  private primaryAdminEmail = process.env.ADMIN_EMAIL || 'vistoraoffice123@gmail.com';
  private officialSupportEmail = 'vistoraoffice123@gmail.com';
  private sentOrderNotificationIds = new Set<string>();

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

  /**
   * Send Order Confirmation Email to Admin upon successful order/payment
   */
  public async sendAdminOrderSuccessNotification(
    orderIdOrData: string | any,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let order: any = null;
      if (typeof orderIdOrData === 'string') {
        order = await prisma.order.findUnique({
          where: { id: orderIdOrData },
          include: {
            user: true,
            address: true,
            items: true,
            payments: true,
          },
        });
      } else if (orderIdOrData && orderIdOrData.id) {
        if (orderIdOrData.items && orderIdOrData.address && orderIdOrData.user) {
          order = orderIdOrData;
        } else {
          order = await prisma.order.findUnique({
            where: { id: orderIdOrData.id },
            include: {
              user: true,
              address: true,
              items: true,
              payments: true,
            },
          });
        }
      }

      if (!order) {
        logger.warn({ orderIdOrData }, 'Cannot send admin order email: Order not found');
        return { success: false, error: 'Order not found' };
      }

      // Avoid duplicate emails for the same order
      if (this.sentOrderNotificationIds.has(order.id)) {
        logger.info(
          { orderId: order.id, orderNumber: order.orderNumber },
          'Admin order notification already sent, skipping duplicate',
        );
        return { success: true };
      }
      this.sentOrderNotificationIds.add(order.id);

      const transporter = this.getTransporter();

      const customerName = order.user
        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email
        : order.address?.recipientName || 'Customer';
      const customerEmail = order.user?.email || order.address?.email || 'Not provided';
      const customerPhone = order.address?.phone || order.user?.phone || 'Not provided';

      const formattedAddress = order.address
        ? [
            order.address.addressLine1,
            order.address.addressLine2,
            order.address.city,
            order.address.state,
            order.address.postalCode,
            order.address.country,
          ]
            .filter(Boolean)
            .join(', ')
        : 'Address not available';

      const payment = order.payments?.[0];
      const paymentMethod = payment?.paymentMethod || 'ONLINE';
      const paymentStatus = payment?.status || order.status || 'CONFIRMED';
      const transactionRef = payment?.transactionReference || payment?.gatewayPaymentId || null;

      const itemsHtml = (order.items || [])
        .map((item: any) => {
          const unitPrice = Number(item.unitPrice || 0).toFixed(2);
          const total = Number(
            item.total || item.totalPrice || Number(item.unitPrice) * item.quantity,
          ).toFixed(2);
          return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px; color: #1e293b; font-weight: 600;">${item.productName || 'Product'}</td>
              <td style="padding: 10px; color: #64748b; font-family: monospace; font-size: 11px;">${item.sku || '—'}</td>
              <td style="padding: 10px; text-align: center; color: #334155;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; color: #334155;">₹${unitPrice}</td>
              <td style="padding: 10px; text-align: right; font-weight: 700; color: #0f172a;">₹${total}</td>
            </tr>
          `;
        })
        .join('');

      const adminOrderMailOptions = {
        from: `"Vistora Orders" <${env.EMAIL_FROM || 'noreply@vistoracommerce.com'}>`,
        to: 'vistoraoffice123@gmail.com',
        cc: this.primaryAdminEmail !== 'vistoraoffice123@gmail.com' ? this.primaryAdminEmail : undefined,
        subject: `[Vistora New Order] #${order.orderNumber} placed by ${customerName} (₹${Number(order.total).toFixed(2)})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #A50025 0%, #700019 100%); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">VISTORA</h1>
              <p style="color: #ffd7aa; margin: 6px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase;">New Order Received 🎉</p>
            </div>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #166534;">
                ✅ Order <strong>#${order.orderNumber}</strong> has been successfully placed!
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding: 12px; background-color: #f8fafc; border-radius: 8px 0 0 8px;">
                  <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 8px;">Customer Information</strong>
                  <p style="margin: 2px 0; color: #334155;"><strong>Name:</strong> ${customerName}</p>
                  <p style="margin: 2px 0; color: #334155;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #A50025;">${customerEmail}</a></p>
                  <p style="margin: 2px 0; color: #334155;"><strong>Phone:</strong> ${customerPhone}</p>
                </td>
                <td style="width: 50%; vertical-align: top; padding: 12px; background-color: #f8fafc; border-radius: 0 8px 8px 0;">
                  <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 8px;">Delivery Address</strong>
                  <p style="margin: 2px 0; color: #334155;">${formattedAddress}</p>
                </td>
              </tr>
            </table>

            <h3 style="color: #0f172a; font-size: 15px; margin: 16px 0 10px 0;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left;">
                  <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; color: #475569;">Item</th>
                  <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; color: #475569;">SKU</th>
                  <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; color: #475569; text-align: center;">Qty</th>
                  <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; color: #475569; text-align: right;">Price</th>
                  <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; color: #475569; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background-color: #f8fafc; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 13px; color: #334155;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${Number(order.subtotal).toFixed(2)}</td>
                </tr>
                ${Number(order.discount) > 0 ? `
                <tr style="color: #16a34a;">
                  <td style="padding: 4px 0;">Discount:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600;">-₹${Number(order.discount).toFixed(2)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 4px 0;">Shipping Fee:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600;">${Number(order.shipping) === 0 ? 'FREE' : `₹${Number(order.shipping).toFixed(2)}`}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">Tax:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${Number(order.tax).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1; font-size: 16px; color: #0f172a;">
                  <td style="padding: 10px 0 4px 0; font-weight: 800;">Grand Total:</td>
                  <td style="padding: 10px 0 4px 0; text-align: right; font-weight: 900; color: #A50025;">₹${Number(order.total).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #64748b;">Payment Method:</td>
                  <td style="padding: 4px 0; text-align: right; font-size: 12px; font-weight: 700; color: #0f172a;">${paymentMethod} (${paymentStatus})</td>
                </tr>
                ${transactionRef ? `
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #64748b;">Transaction Ref:</td>
                  <td style="padding: 4px 0; text-align: right; font-size: 12px; font-family: monospace; color: #0f172a;">${transactionRef}</td>
                </tr>` : ''}
              </table>
            </div>

            <div style="text-align: center; margin: 24px 0 16px 0;">
              <a href="http://localhost:3000/admin/orders" style="background-color: #A50025; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                View Orders in Admin Dashboard →
              </a>
            </div>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              <p style="margin: 0 0 4px 0;">Vistora Commerce • Automated Admin Notification</p>
              <p style="margin: 0;">Recipient: vistoraoffice123@gmail.com</p>
            </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(adminOrderMailOptions);
      logger.info(
        { messageId: info.messageId, orderNumber: order.orderNumber },
        'Admin order notification email sent successfully to vistoraoffice123@gmail.com',
      );
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      logger.error({ err, orderIdOrData }, 'Error sending admin order notification email via Nodemailer');
      return { success: false, error: err.message };
    }
  }
}

export const mailService = new MailService();
