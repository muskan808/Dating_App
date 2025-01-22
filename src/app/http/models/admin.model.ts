import { model, Schema, Model } from 'mongoose';
import { adminType, statusEnum } from '../types/admin.types';

const adminSchema = new Schema({
    firstName: {
        type:String,
        require:true
    },
    lastName: {
        type:String,
        require:true
    },
    email: {
        type:String,
        require:true
    },
    password: {
        type:String,
        require:true
    },
    forgotPasswordToken: {
        type:String,
        require:true
    },
    status: {
        type: String,
        enum: statusEnum,
        default: statusEnum.ACTIVE,
        require:true
    },
    phoneCode: {
        type: String,
        required: true
    },
    phoneNumber:{
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date,
    deletedAt: Date,
}, { timestamps: true });



// Define the interface for the User model
const Admin = model<adminType>('admins', adminSchema);

export { adminType, Admin };