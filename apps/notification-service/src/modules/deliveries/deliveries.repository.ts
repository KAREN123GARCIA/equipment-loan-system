import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery } from './delivery.schema';

@Injectable()
export class DeliveriesRepository {
  constructor(@InjectModel(Delivery.name) private readonly model: Model<Delivery>) {}
  create(data: Partial<Delivery>) { return this.model.create(data); }
  findById(id: string) { return this.model.findById(id).lean(); }
  findByEventId(eventId: string) { return this.model.findOne({ eventId }).lean(); }
  list(filter: any) { return this.model.find(filter).sort({ createdAt: -1 }).lean(); }
  update(id: string, patch: Partial<Delivery>) { return this.model.findByIdAndUpdate(id, patch, { new: true }).lean(); }
  findDueRetries(now: Date) {
    return this.model.find({ status: { $in: ['PENDING', 'FAILED'] }, nextAttemptAt: { $lte: now } })
      .sort({ nextAttemptAt: 1 }).limit(50).lean();
  }
}
