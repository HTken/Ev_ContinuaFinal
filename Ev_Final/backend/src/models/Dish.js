import mongoose from 'mongoose';

const DishSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
  description: { type: String, trim: true, default: '' },
  price: { type: Number, required: [true, 'El precio es obligatorio'], min: [0, 'El precio no puede ser negativo'] },
  category: { type: String, enum: ['Entrada', 'Fondo', 'Postre', 'Bebida'], default: 'Fondo' },
  spicy: { type: Boolean, default: false },
}, { timestamps: true });

DishSchema.index({ name: 'text', description: 'text', category: 1 });

export default mongoose.model('Dish', DishSchema);
