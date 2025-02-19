import mongoose, { Model, Schema } from 'mongoose';
import { ISubscription } from '../utils/interfaces';

interface SubscriptionMethods { }

type SubscriptionModel = Model<ISubscription, {}, SubscriptionMethods>;

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel, SubscriptionMethods>(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription, SubscriptionModel>('Subscription', subscriptionSchema);
