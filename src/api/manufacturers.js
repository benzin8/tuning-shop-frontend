import client from './client'

export const getManufacturers = () => client.get('/manufacturers/')
export const createManufacturer = (manufacturer_name) =>
  client.post('/manufacturers/', { manufacturer_name })
export const deleteManufacturer = (id) => client.delete(`/manufacturers/${id}`)
