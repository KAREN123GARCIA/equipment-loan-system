import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ timestamps: true, collection: 'templates' })
export class Template {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ required: true })
  channel!: 'email' | 'inapp';

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ default: true })
  enabled!: boolean;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
TemplateSchema.index({ key: 1 }, { unique: true });
