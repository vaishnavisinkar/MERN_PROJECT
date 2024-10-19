import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
      },
      title: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      sold: {
        type: Boolean,
        default: false
      },
      dateOfSale: {
        type: Date,
        default: null
      }
    });
    export default mongoose.model('Product', dataSchema);
