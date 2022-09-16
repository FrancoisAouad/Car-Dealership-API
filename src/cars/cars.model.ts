import mongoose, { ObjectId, Schema } from 'mongoose';
export interface CarInterface {
    title: {
        en: String;
        ar: String;
    };
    brandID: ObjectId;
    engine: string;
    color: string;
    creatorID: ObjectId;
    mostSoldIn: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
const CarSchema: Schema = new Schema({
    title: {
        ar: {
            type: String,
        },
        en: {
            type: String,
        },
    },
    brandID: {
        type: mongoose.Types.ObjectId,
        ref: 'Brand',
    },
    engine: String,
    color: String,
    creatorID: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    soldIn: {
        type: mongoose.Types.ObjectId,
        ref: 'Country',
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

export default mongoose.model<CarInterface>('Car', CarSchema);
