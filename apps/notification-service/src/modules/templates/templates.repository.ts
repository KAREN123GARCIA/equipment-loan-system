import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template } from './template.schema';

@Injectable()
export class TemplatesRepository {
  constructor(@InjectModel(Template.name) private readonly model: Model<Template>) {}
  create(data: Partial<Template>) { return this.model.create(data); }
  findAll() { return this.model.find().sort({ key: 1 }).lean(); }
  findById(id: string) { return this.model.findById(id).lean(); }
  findByKey(key: string) { return this.model.findOne({ key }).lean(); }
  update(id: string, patch: Partial<Template>) { return this.model.findByIdAndUpdate(id, patch, { new: true }).lean(); }
  delete(id: string) { return this.model.findByIdAndDelete(id).lean(); }
}
