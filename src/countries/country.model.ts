import mongoose, { Schema } from 'mongoose';
export interface CountryInterface {
    name: {
        en: String;
        ar: String;
    };
    value: string;
}
const CountrySchema: Schema = new Schema({
    name: {
        ar: {
            type: String,
        },
        en: {
            type: String,
        },
    },
    value: String,
});

export default mongoose.model<CountryInterface>('Country', CountrySchema);
