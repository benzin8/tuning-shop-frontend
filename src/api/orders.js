import client from './client'

export const createOrder = (data) => client.post('/orders/', data)
export const getMyOrders = () => client.get('/orders/my')
export const getOrder = (id) => client.get(`/orders/${id}`)
export const getAllOrders = () => client.get('/orders/')
export const getOrderStatuses = () => client.get('/orders/statuses')
export const updateOrderStatus = (id, status_id) =>
  client.patch(`/orders/${id}/status`, { status_id })
