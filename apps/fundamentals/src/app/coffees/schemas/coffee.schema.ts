import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Flavor } from './flavor.schema';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Coffee {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  brand!: string;

  @Prop({ default: 0 })
  recommendations!: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: Flavor.name }], default: [] })
  flavors!: Types.ObjectId[] | Flavor[];
}

export type CoffeeDocument = HydratedDocument<Coffee>;

export const CoffeeSchema = SchemaFactory.createForClass(Coffee);
