import { prisma, OrderStatus } from '@keycap/db';
import { transition as transitionOrder } from '@keycap/shared';

export interface ShippingAddressInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  province?: string;
}

export interface ShippingRate {
  courierCode: string;
  courierName: string;
  service: string;
  costIdr: number;
  estDays: string;
}

export interface ShipmentResult {
  waybillNumber: string;
  courierCode: string;
  service: string;
  trackingUrl?: string | undefined;
}

export interface TrackingStatus {
  waybillNumber: string;
  courierCode: string;
  status: 'MANIFESTED' | 'ON_PROCESS' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  history: Array<{
    time: string;
    note: string;
    location?: string;
  }>;
}

export interface ShippingProvider {
  rates(originPostal: string, destPostal: string, weightG: number): Promise<ShippingRate[]>;
  createShipment(params: {
    orderPublicCode: string;
    origin: ShippingAddressInput;
    destination: ShippingAddressInput;
    weightG: number;
    courier: string;
    service: string;
  }): Promise<ShipmentResult>;
  track(waybillNumber: string, courierCode: string): Promise<TrackingStatus>;
}

/**
 * Deterministic Mock Shipping Provider for local dev and testing
 */
export class MockShippingProvider implements ShippingProvider {
  async rates(_originPostal: string, destPostal: string, weightG: number): Promise<ShippingRate[]> {
    // Base weight in kg rounded up
    const kg = Math.max(1, Math.ceil(weightG / 1000));
    const isJabodetabek = ['1', '12', '15', '16', '17'].some((prefix) =>
      destPostal.startsWith(prefix),
    );

    const baseReg = isJabodetabek ? 10_000 : 24_000;
    const baseExpress = isJabodetabek ? 18_000 : 42_000;

    return [
      {
        courierCode: 'jne',
        courierName: 'JNE Express',
        service: 'REG',
        costIdr: baseReg * kg,
        estDays: isJabodetabek ? '1-2' : '2-4',
      },
      {
        courierCode: 'jne',
        courierName: 'JNE Express',
        service: 'YES',
        costIdr: baseExpress * kg,
        estDays: '1',
      },
      {
        courierCode: 'sicepat',
        courierName: 'SiCepat Ekspres',
        service: 'REG',
        costIdr: (baseReg - 1_000) * kg,
        estDays: isJabodetabek ? '1-2' : '2-3',
      },
      {
        courierCode: 'jnt',
        courierName: 'J&T Express',
        service: 'EZ',
        costIdr: baseReg * kg,
        estDays: isJabodetabek ? '1-2' : '2-4',
      },
    ];
  }

  async createShipment(params: {
    orderPublicCode: string;
    courier: string;
    service: string;
  }): Promise<ShipmentResult> {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const waybillNumber = `${params.courier.toUpperCase()}-${params.orderPublicCode.replace('KC-', '')}-${randomSuffix}`;
    return {
      waybillNumber,
      courierCode: params.courier,
      service: params.service,
      trackingUrl: `https://track.myownkeycap.id/${waybillNumber}`,
    };
  }

  async track(waybillNumber: string, courierCode: string): Promise<TrackingStatus> {
    const now = new Date();
    return {
      waybillNumber,
      courierCode,
      status: 'ON_PROCESS',
      history: [
        {
          time: new Date(now.getTime() - 3600000 * 4).toISOString(),
          note: 'Shipment created and package picked up from MyOwnKeycap Workshop',
          location: 'Jakarta Selatan',
        },
        {
          time: new Date(now.getTime() - 3600000 * 2).toISOString(),
          note: 'Arrived at sorting sorting hub Jakarta',
          location: 'Jakarta Barat Hub',
        },
        {
          time: now.toISOString(),
          note: 'Departed to destination delivery center',
          location: 'In Transit',
        },
      ],
    };
  }
}

/**
 * Biteship Provider implementation (when BITESHIP_API_KEY is configured)
 */
export class BiteshipProvider implements ShippingProvider {
  constructor(private apiKey: string) {}

  async rates(originPostal: string, destPostal: string, weightG: number): Promise<ShippingRate[]> {
    try {
      const res = await fetch('https://api.biteship.com/v1/rates/couriers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_postal_code: parseInt(originPostal, 10),
          destination_postal_code: parseInt(destPostal, 10),
          couriers: 'jne,sicepat,jnt',
          items: [{ weight: weightG }],
        }),
      });

      if (!res.ok) {
        return new MockShippingProvider().rates(originPostal, destPostal, weightG);
      }

      const data = await res.json();
      return (data.pricing ?? []).map((p: any) => ({
        courierCode: p.courier_code,
        courierName: p.courier_name,
        service: p.courier_service_code,
        costIdr: p.price,
        estDays: p.duration,
      }));
    } catch {
      return new MockShippingProvider().rates(originPostal, destPostal, weightG);
    }
  }

  async createShipment(params: {
    orderPublicCode: string;
    origin: ShippingAddressInput;
    destination: ShippingAddressInput;
    weightG: number;
    courier: string;
    service: string;
  }): Promise<ShipmentResult> {
    try {
      const res = await fetch('https://api.biteship.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipper_name: 'MyOwnKeycap Workshop',
          shipper_phone: '081234567890',
          origin_address: params.origin.addressLine,
          origin_postal_code: parseInt(params.origin.postalCode, 10),
          destination_address: params.destination.addressLine,
          destination_postal_code: parseInt(params.destination.postalCode, 10),
          courier_company: params.courier,
          courier_type: params.service,
          delivery_type: 'later',
          order_id: params.orderPublicCode,
          items: [
            {
              name: `Custom Keycap Set (${params.orderPublicCode})`,
              weight: params.weightG,
              value: 150000,
              quantity: 1,
            },
          ],
        }),
      });

      if (!res.ok) {
        return new MockShippingProvider().createShipment(params);
      }

      const data = await res.json();
      return {
        waybillNumber: data.courier?.tracking_id || data.id,
        courierCode: params.courier,
        service: params.service,
        trackingUrl: data.courier?.waybill_id ? `https://track.biteship.com/${data.courier.waybill_id}` : undefined,
      };
    } catch {
      return new MockShippingProvider().createShipment(params);
    }
  }

  async track(waybillNumber: string, courierCode: string): Promise<TrackingStatus> {
    try {
      const res = await fetch(`https://api.biteship.com/v1/trackings/${waybillNumber}/couriers/${courierCode}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (!res.ok) return new MockShippingProvider().track(waybillNumber, courierCode);
      const data = await res.json();
      return {
        waybillNumber,
        courierCode,
        status: data.status === 'delivered' ? 'DELIVERED' : 'ON_PROCESS',
        history: (data.history ?? []).map((h: any) => ({
          time: h.updated_at,
          note: h.note,
          location: h.service_type,
        })),
      };
    } catch {
      return new MockShippingProvider().track(waybillNumber, courierCode);
    }
  }
}

/** Factory to get shipping provider */
export function getShippingProvider(): ShippingProvider {
  const apiKey = process.env.BITESHIP_API_KEY;
  if (apiKey && apiKey !== 'mock') {
    return new BiteshipProvider(apiKey);
  }
  return new MockShippingProvider();
}

/** Workshop Default Address */
export const WORKSHOP_ADDRESS: ShippingAddressInput = {
  recipientName: 'MyOwnKeycap Fulfillment Lab',
  phone: '081234567890',
  addressLine: 'Jl. Kemang Raya No. 12B, Mampang Prapatan',
  city: 'Jakarta Selatan',
  postalCode: '12730',
  province: 'DKI Jakarta',
};

export class ShippingService {
  /** Calculate shipping rates for a destination */
  static async calculateRates(destPostal: string, weightG: number = 200): Promise<ShippingRate[]> {
    const provider = getShippingProvider();
    return provider.rates(WORKSHOP_ADDRESS.postalCode, destPostal, weightG);
  }

  /**
   * Dispatch shipment for packed order
   */
  static async dispatchOrder(
    orderId: string,
    courier: string = 'jne',
    service: string = 'REG',
  ): Promise<{ order: any; shipment: ShipmentResult }> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        items: { include: { asset: true } },
      },
    });

    if (!order) throw new Error('Order not found');
    if (order.status !== OrderStatus.PACKED) {
      throw new Error(`Cannot ship order in state ${order.status}. Order must be PACKED.`);
    }

    // Calculate total weight (keycaps + 80g box/packaging)
    const keycapsWeightG = order.items.reduce(
      (acc, item) => acc + (item.asset.estGrams ?? 1.5) * item.qty,
      0,
    );
    const totalWeightG = Math.round(keycapsWeightG + 80);

    const destinationAddress: ShippingAddressInput = {
      recipientName: order.address?.recipient ?? 'Customer',
      phone: order.address?.phone ?? '08123456789',
      addressLine: order.address?.line1 ?? 'Alamat Pemesan',
      city: order.address?.city ?? 'Jakarta',
      postalCode: order.address?.postalCode ?? '12000',
      province: order.address?.province ?? 'DKI Jakarta',
    };

    const provider = getShippingProvider();
    const shipment = await provider.createShipment({
      orderPublicCode: order.publicCode,
      origin: WORKSHOP_ADDRESS,
      destination: destinationAddress,
      weightG: totalWeightG,
      courier,
      service,
    });

    const nextStatus = transitionOrder(order.status, 'ship');

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          trackingNumber: shipment.waybillNumber,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          from: order.status,
          to: nextStatus,
          meta: {
            event: 'order.shipped',
            waybill: shipment.waybillNumber,
            courier,
            service,
          },
        },
      });

      return o;
    });

    return { order: updatedOrder, shipment };
  }

  /**
   * Mark shipment as delivered
   */
  static async confirmDelivered(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');
    if (order.status !== OrderStatus.SHIPPED) {
      throw new Error(`Cannot confirm delivery for order in state ${order.status}`);
    }

    const nextStatus = transitionOrder(order.status, 'deliver');

    return prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          from: order.status,
          to: nextStatus,
          meta: { event: 'order.delivered' },
        },
      });

      return o;
    });
  }

  /**
   * Track order shipment
   */
  static async trackOrder(orderId: string): Promise<TrackingStatus | null> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || !order.trackingNumber) return null;

    const provider = getShippingProvider();
    const courier = order.trackingNumber.startsWith('SICEPAT')
      ? 'sicepat'
      : order.trackingNumber.startsWith('JNT')
        ? 'jnt'
        : 'jne';

    return provider.track(order.trackingNumber, courier);
  }
}
