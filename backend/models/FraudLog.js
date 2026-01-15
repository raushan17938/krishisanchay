import mongoose from "mongoose";

const fraudLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        transactionAmount: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        details: {
            type: String, // Storing JSON string of products/context
        },
    },
    { timestamps: true }
);

const FraudLog = mongoose.model("FraudLog", fraudLogSchema);

export default FraudLog;
