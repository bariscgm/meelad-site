import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ classFrom: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, classFrom, classTo } = req.body;
    
    const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name, classFrom, classTo });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Invalid category data', error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { name, classFrom, classTo } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      category.classFrom = classFrom || category.classFrom;
      category.classTo = classTo || category.classTo;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Failed to update category', error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: req.params.id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
};
