import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { ApiError } from '../../utils/api-error.util';
import { mailService } from '../../services/mail.service';

export class ContactController {
  public submitContactForm = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !message) {
      throw ApiError.badRequest('Name, email, and message are required fields');
    }

    if (!email.includes('@')) {
      throw ApiError.badRequest('Please provide a valid email address');
    }

    const result = await mailService.sendContactInquiry({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || 'Vistora Customer Inquiry').trim(),
      message: message.trim(),
      phone: phone ? phone.trim() : undefined,
    });

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Your message has been sent to Vistora Support. We will get back to you shortly!',
      result
    );
  };

  public subscribeNewsletter = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      throw ApiError.badRequest('Please provide a valid email address');
    }

    const result = await mailService.sendNewsletterWelcome({
      email: email.trim(),
    });

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Thank you for subscribing to Vistora! Welcome details have been sent to your email.',
      result
    );
  };
}
