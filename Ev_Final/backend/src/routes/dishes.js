import express from 'express';
import Dish from '../models/Dish.js';

const router = express.Router();


router.get('/', async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 10, category } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Dish.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Dish.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Dish.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Plato no encontrado' });
    res.json(item);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description, price, category, spicy } = req.body;
    const created = await Dish.create({ name, description, price, category, spicy });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, price, category, spicy } = req.body;
    const updated = await Dish.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, spicy },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Plato no encontrado' });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Dish.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Plato no encontrado' });
    res.json({ message: 'Plato eliminado' });
  } catch (err) { next(err); }
});


router.post('/seed', async (_req, res, next) => {
  try {
    await Dish.deleteMany({});
    const data = [
      { name: 'Lomo Saltado', description: 'Clásico peruano salteado', price: 28, category: 'Fondo' },
      { name: 'Ceviche', description: 'Pescado fresco en limón', price: 32, category: 'Entrada', spicy: true },
      { name: 'Suspiro a la Limeña', description: 'Postre tradicional', price: 15, category: 'Postre' },
      { name: 'Chicha Morada', description: 'Bebida de maíz morado', price: 7, category: 'Bebida' }
    ];
    const inserted = await Dish.insertMany(data);
    res.status(201).json({ inserted });
  } catch (err) { next(err); }
});

export default router;
