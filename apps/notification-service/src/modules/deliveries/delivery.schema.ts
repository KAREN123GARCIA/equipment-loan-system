import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeliveryDocument = HydratedDocument<Delivery>;
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';

@Schema({ timestamps: true, collection: 'deliveries' })
export class Delivery {
  @Prop({ required: true, unique: true }) eventId!: string;
  @Prop({ required: true }) eventType!: string;
  @Prop({ required: true }) userId!: string;
  @Prop() userEmail?: string;
  @Prop({ required: true }) channel!: 'email' | 'inapp';
  @Prop() templateKey?: string;
  @Prop() subject?: string;
  @Prop() body?: string;
  @Prop({ required: true, default: 'PENDING' }) status!: DeliveryStatus;
  @Prop({ default: 0 }) attempts!: number;
  @Prop() lastError?: string;
  @Prop() correlationId?: string;
  @Prop() nextAttemptAt?: Date;
  @Prop() sentAt?: Date;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);
DeliverySchema.index({ eventId: 1 }, { unique: true });
DeliverySchema.index({ userId: 1, createdAt: -1 });
DeliverySchema.index({ status: 1, nextAttemptAt: 1 });
