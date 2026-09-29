"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const client_1 = require("@prisma/client");
const base_repository_1 = require("./base.repository");
class OrderRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.order;
    }
    async findOrders(filters) {
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.userId) {
            where.userId = filters.userId;
        }
        if (filters.paymentStatus) {
            where.payments = {
                some: {
                    status: filters.paymentStatus,
                },
            };
        }
        if (filters.shipmentStatus) {
            where.shipment = {
                shipmentStatus: filters.shipmentStatus,
            };
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                start.setUTCHours(0, 0, 0, 0);
                where.createdAt.gte = start;
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setUTCHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }
        if (filters.search) {
            const search = filters.search.trim();
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { phone: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            avatar: true,
                        },
                    },
                    address: true,
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: {
                                        take: 1,
                                    },
                                    brand: true,
                                    category: true,
                                },
                            },
                            variant: true,
                        },
                    },
                    payments: true,
                    shipment: true,
                    invoice: true,
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOrderById(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        avatar: true,
                    },
                },
                address: true,
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                brand: true,
                                category: true,
                            },
                        },
                        variant: true,
                    },
                },
                payments: true,
                shipment: true,
                invoice: true,
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
                couponUsages: {
                    include: {
                        coupon: true,
                    },
                },
            },
        });
    }
    async updateOrderStatus(id, status, remarks, updatedBy, shippingInfo) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id },
                data: { status },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status,
                    remarks: remarks || `Order status updated to ${status}`,
                    updatedBy: updatedBy || 'System Admin',
                },
            });
            // Synchronize shipment status and offline courier tracking details
            const isShippedOrDelivered = status === client_1.OrderStatus.SHIPPED || status === client_1.OrderStatus.DELIVERED;
            const hasTrackingDetails = Boolean(shippingInfo?.courierName || shippingInfo?.trackingNumber || shippingInfo?.trackingUrl);
            if (isShippedOrDelivered || hasTrackingDetails) {
                const shipmentStatus = status === client_1.OrderStatus.DELIVERED
                    ? client_1.ShipmentStatus.DELIVERED
                    : status === client_1.OrderStatus.SHIPPED
                        ? client_1.ShipmentStatus.SHIPPED
                        : client_1.ShipmentStatus.IN_TRANSIT;
                const existingShipment = await tx.shipment.findUnique({ where: { orderId: id } });
                const courierName = shippingInfo?.courierName?.trim() ||
                    existingShipment?.courierName ||
                    'The Professional Couriers';
                const courierNameLower = courierName.toLowerCase();
                const defaultCourierUrl = courierNameLower.includes('professional') || courierNameLower.includes('tpc')
                    ? 'https://www.tpcindia.com'
                    : courierNameLower.includes('st courier') || courierNameLower.includes('stc') || courierNameLower.includes('st ')
                        ? 'https://stcourier.com'
                        : courierNameLower.includes('post') || courierNameLower.includes('india post')
                            ? 'https://www.indiapost.gov.in'
                            : courierNameLower.includes('dtdc')
                                ? 'https://www.dtdc.in'
                                : courierNameLower.includes('franch')
                                    ? 'https://www.franchexpress.com'
                                    : courierNameLower.includes('trackon')
                                        ? 'https://trackon.in'
                                        : courierNameLower.includes('blue dart') || courierNameLower.includes('bluedart')
                                            ? 'https://www.bluedart.com'
                                            : courierNameLower.includes('delhivery')
                                                ? 'https://www.delhivery.com'
                                                : 'https://www.tpcindia.com';
                const trackingNumber = shippingInfo?.trackingNumber?.trim() ||
                    existingShipment?.trackingNumber ||
                    `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
                const trackingUrl = shippingInfo?.trackingUrl !== undefined && shippingInfo.trackingUrl?.trim() !== ''
                    ? shippingInfo.trackingUrl.trim()
                    : existingShipment?.trackingUrl || defaultCourierUrl;
                await tx.shipment.upsert({
                    where: { orderId: id },
                    update: {
                        shipmentStatus,
                        courierName,
                        trackingNumber,
                        trackingUrl,
                        ...(status === client_1.OrderStatus.SHIPPED && !existingShipment?.shippedAt ? { shippedAt: new Date() } : {}),
                        ...(status === client_1.OrderStatus.DELIVERED && !existingShipment?.deliveredAt ? { deliveredAt: new Date() } : {}),
                        ...(remarks ? { remarks } : {}),
                    },
                    create: {
                        orderId: id,
                        shipmentStatus,
                        courierName,
                        trackingNumber,
                        trackingUrl,
                        ...(status === client_1.OrderStatus.SHIPPED ? { shippedAt: new Date() } : {}),
                        ...(status === client_1.OrderStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
                        remarks: remarks || null,
                    },
                });
            }
            return order;
        });
    }
    async cancelOrder(id, reason, updatedBy) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id },
                data: { status: client_1.OrderStatus.CANCELLED, notes: reason ? `Cancelled: ${reason}` : 'Cancelled by staff' },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status: client_1.OrderStatus.CANCELLED,
                    remarks: reason || 'Order cancelled',
                    updatedBy: updatedBy || 'System Admin',
                },
            });
            return order;
        });
    }
    async ensureInvoice(orderId) {
        const existing = await this.prisma.invoice.findUnique({
            where: { orderId },
            include: {
                order: {
                    include: {
                        user: true,
                        address: true,
                        items: true,
                        payments: true,
                    },
                },
            },
        });
        if (existing)
            return existing;
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new Error('Order not found');
        const invoiceNumber = `INV-${order.orderNumber}`;
        return this.prisma.invoice.create({
            data: {
                orderId,
                invoiceNumber,
            },
            include: {
                order: {
                    include: {
                        user: true,
                        address: true,
                        items: true,
                        payments: true,
                    },
                },
            },
        });
    }
    async getOrderStats() {
        const [totalOrders, pendingOrders, completedOrders, cancelledOrders, revenueAgg] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.PENDING } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.DELIVERED } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.CANCELLED } }),
            this.prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { not: client_1.OrderStatus.CANCELLED } },
            }),
        ]);
        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: Number(revenueAgg._sum.total || 0),
        };
    }
}
exports.OrderRepository = OrderRepository;
