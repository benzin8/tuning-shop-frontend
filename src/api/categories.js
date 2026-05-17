import client from './client'

export const getCategories = () => client.get('/categories/')
export const createCategory = (category_name) => client.post('/categories/', { category_name })
export const deleteCategory = (id) => client.delete(`/categories/${id}`)
