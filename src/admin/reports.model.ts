import mongoose, { ObjectId, Schema } from 'mongoose';
export interface ReportInterface {}
const ReportSchema: Schema = new Schema({
    report: {},
    subject: {
        type: String,
        default: '',
        required: true,
    },
    description: {
        type: String,
        default: 'No description..',
    },
    sentBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        default: 'pending',
    },
    approvedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    rejectedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    dateCreated: {
        type: Date,
        default: Date.now(),
    },
    approvalDate: {
        type: Date,
        default: null,
    },
    rejectionDate: {
        type: Date,
        default: null,
    },
});

export default mongoose.model<ReportInterface>('Report', ReportSchema);
