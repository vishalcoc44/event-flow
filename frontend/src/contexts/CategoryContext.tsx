'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { categoriesAPI } from '@/lib/api'

type Category = {
  id: string
  name: string
  title?: string // Add title property for compatibility
  description: string
  created_at?: string
}

type CategoryContextType = {
  categories: Category[]
  loading: boolean
  error: string | null
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<Category | null>
  updateCategory: (id: string, category: Partial<Category>) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>
  fetchCategories: () => Promise<void>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await categoriesAPI.getAllCategories()
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError(err.message || 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    try {
      setLoading(true)
      setError(null)
      const newCategory = await categoriesAPI.createCategory(categoryData)
      if (newCategory) {
        setCategories(prev => [...prev, newCategory])
      }
      return newCategory
    } catch (err: any) {
      console.error('Error adding category:', err)
      setError(err.message || 'Failed to add category')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      setLoading(true)
      setError(null)
      const updatedCategory = await categoriesAPI.updateCategory(id, categoryData)
      if (updatedCategory) {
        setCategories(prev => prev.map(cat => 
          cat.id === id ? { ...cat, ...updatedCategory } : cat
        ))
      }
      return updatedCategory
    } catch (err: any) {
      console.error('Error updating category:', err)
      setError(err.message || 'Failed to update category')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await categoriesAPI.deleteCategory(id)
      if (result.success) {
        setCategories(prev => prev.filter(cat => cat.id !== id))
      }
      return result.success
    } catch (err: any) {
      console.error('Error deleting category:', err)
      setError(err.message || 'Failed to delete category')
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <CategoryContext.Provider value={{ 
      categories, 
      loading, 
      error, 
      addCategory, 
      updateCategory, 
      deleteCategory,
      fetchCategories
    }}>
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategories = () => {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}

