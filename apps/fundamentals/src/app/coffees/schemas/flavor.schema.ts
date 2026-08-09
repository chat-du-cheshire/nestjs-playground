import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Flavor {
  @Prop({ required: true, unique: true })
  name!: string;
}

export type FlavorDocument = HydratedDocument<Flavor>;

export const FlavorSchema = SchemaFactory.createForClass(Flavor);
