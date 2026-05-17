import client from './client'

export const getProducts = (params) => client.get('/products/', { params })
export const getProduct = (id) => client.get(`/products/${id}`)
export const createProduct = (data) => client.post('/products/', data)
export const updateProduct = (id, data) => client.patch(`/products/${id}`, data)
export const deleteProduct = (id) => client.delete(`/products/${id}`)
export const addCompatibility = (productId, carId) =>
  client.post(`/products/${productId}/compatibility`, { product_id: productId, car_id: carId })
export const removeCompatibility = (productId, carId) =>
  client.delete(`/products/${productId}/compatibility/${carId}`)
