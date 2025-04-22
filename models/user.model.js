import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true
    },
    profile:{
        bio:{type:String},
        skills:[{type:String}],
        resume:{type:String}, // URL to resume file
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        },
        linkedin: { type: String, default: "" },  
        leetcode: { type: String, default: "" },  
        portfolio: { type: String, default: "" },  
        workExperience: [{
            title: { type: String},
            company: { type: String },
            description: { type: String},
            link: { type: String },
            startDate: { type: Date },
            endDate: { type: Date }
        }],
        projects: [{
            title: { type: String},
            description: { type: String},
            link: { type: String }
        }],
        achievements: [{
            title: { type: String },
            description: { type: String}
        }]

    },
},{timestamps:true});
export const User = mongoose.model('User', userSchema);