import client from './client'

export const getMe = () => client.get('/users/me')
export const updateMe = (data) => client.patch('/users/me', data)
export const getAllUsers = () => client.get('/users/')
export const getUser = (id) => client.get(`/users/${id}`)
export const updateRole = (id, role_id) => client.patch(`/users/${id}/role`, { role_id })
