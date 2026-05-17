import client from './client'

export const getServices = () => client.get('/services/')
export const getMyServiceRequests = () => client.get('/services/requests/my')
export const getAllServiceRequests = () => client.get('/services/requests/')
export const createServiceRequest = (data) => client.post('/services/requests/', data)
export const updateServiceRequestStatus = (id, status) =>
  client.patch(`/services/requests/${id}`, { status })
