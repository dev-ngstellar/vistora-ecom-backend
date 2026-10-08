"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
class ShippingService {
    async estimateShipping(input) {
        const { subtotal } = input;
        const freeShippingThreshold = 0.0;
        const isFreeEligible = true;
        const amountNeeded = 0;
        const standardCost = 0.0;
        const methods = [
            {
                id: 'standard-delivery',
                name: 'Standard Express Courier',
                code: 'STANDARD',
                description: 'Delivered in 3 to 5 business days with live tracking',
                cost: standardCost,
                estimatedDays: '3-5 Business Days',
                isFree: isFreeEligible,
            },
            {
                id: 'next-day-priority',
                name: 'VIP Next-Day Priority',
                code: 'PRIORITY',
                description: 'Guaranteed next-day delivery for urgent orders',
                cost: 35.0,
                estimatedDays: '1 Business Day',
                isFree: false,
            },
        ];
        return {
            subtotal,
            freeShippingEligible: isFreeEligible,
            freeShippingThreshold,
            amountNeededForFreeShipping: amountNeeded,
            methods,
        };
    }
}
exports.ShippingService = ShippingService;
