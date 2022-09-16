import mongoose, { ObjectId, Schema } from 'mongoose';
//INTERFACE
export interface BrandInterface {
    name: {
        ar: string;
        en: string;
    };
    createdDate: Date;
    updatedDate: Date;
    creatorID: ObjectId;
}
//SCHEMA
const BrandSchema: Schema = new Schema({
    name: {
        ar: {
            type: String,
        },
        en: {
            type: String,
        },
    },
    creatorID: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
    updatedDate: {
        type: Date,
        default: Date.now(),
    },
});

export default mongoose.model<BrandInterface>('Brand', BrandSchema);
