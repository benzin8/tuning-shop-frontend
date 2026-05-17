import client from './client'

export const getBrands = () => client.get('/cars/brands/')
export const createBrand = (brand_name) => client.post('/cars/brands/', { brand_name })
export const getModels = (brand_id) => client.get('/cars/models/', { params: brand_id ? { brand_id } : {} })
export const createModel = (data) => client.post('/cars/models/', data)
export const getCars = (model_id) => client.get('/cars/', { params: model_id ? { model_id } : {} })
export const getCar = (id) => client.get(`/cars/${id}`)
export const createCar = (data) => client.post('/cars/', data)
export const deleteBrand = (id) => client.delete(`/cars/brands/${id}`)
export const deleteModel = (id) => client.delete(`/cars/models/${id}`)
export const deleteCar = (id) => client.delete(`/cars/${id}`)
