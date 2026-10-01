import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.util';
import { ContactController } from './contact.controller';

const contactRouter = Router();
const contactController = new ContactController();

/**
 * @openapi
 * /contact:
 *   post:
 *     tags:
 *       - Contact & Support
 *     summary: Submit customer contact/inquiry message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully via Nodemailer
 */
contactRouter.post('/contact', asyncHandler(contactController.submitContactForm));

/**
 * @openapi
 * /newsletter/subscribe:
 *   post:
 *     tags:
 *       - Newsletter
 *     summary: Subscribe to Vistora newsletter & receive latest version/catalog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscribed successfully and welcome email sent
 */
contactRouter.post('/newsletter/subscribe', asyncHandler(contactController.subscribeNewsletter));

export { contactRouter };
