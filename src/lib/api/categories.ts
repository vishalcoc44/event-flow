import { supabase } from '../supabase';
import { validateData, CreateCategorySchema, UpdateCategorySchema, getFirstError } from '../validations';
import type { Category } from '@/types/database';

export const categoriesAPI = {
	getAllCategories: async () => {
		try {
			const { data, error } = await supabase
				.from('categories')
				.select('*');

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get categories error:', error);
			throw error;
		}
	},

	getCategoryById: async (id: string) => {
		try {
			const { data, error } = await supabase
				.from('categories')
				.select('*')
				.eq('id', id)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error('Get category error:', error);
			throw error;
		}
	},

	createCategory: async (categoryData: { name: string; description?: string }): Promise<Category> => {
		try {
			const validation = validateData(CreateCategorySchema, categoryData);
			if (!validation.success) throw new Error(getFirstError(validation.errors));

			const { data, error } = await supabase
				.from('categories')
				.insert([{
					name: validation.data.name,
					description: validation.data.description || null
				}])
				.select('*')
				.single();

			if (error) throw error;
			return data as Category;
		} catch (error) {
			console.error('Create category error:', error);
			throw error;
		}
	},

	updateCategory: async (id: string, categoryData: { name?: string; description?: string }): Promise<Category> => {
		try {
			const validation = validateData(UpdateCategorySchema, categoryData);
			if (!validation.success) throw new Error(getFirstError(validation.errors));

			const { data, error } = await supabase
				.from('categories')
				.update(validation.data)
				.eq('id', id)
				.select('*')
				.single();

			if (error) throw error;
			return data as Category;
		} catch (error) {
			console.error('Update category error:', error);
			throw error;
		}
	},

	deleteCategory: async (id: string) => {
		try {
			const { error } = await supabase
				.from('categories')
				.delete()
				.eq('id', id);

			if (error) throw error;
			return { success: true };
		} catch (error) {
			console.error('Delete category error:', error);
			throw error;
		}
	}
};
