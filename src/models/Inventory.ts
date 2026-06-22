import mongoose, { Schema, Model } from 'mongoose';
import { IInventory } from '../types';

const inventorySchema = new Schema<IInventory>(
    {
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        minStock: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
inventorySchema.index({ name: 1 });
inventorySchema.index({ category: 1 });

export const Inventory: Model<IInventory> = mongoose.model<IInventory>('Inventory', inventorySchema);
