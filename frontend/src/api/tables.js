import axios from './axios'

// Get all schemas
export const getSchemasList = () => {
  return axios.get('/tables/schemas')
}

// Get all tables
export const getTablesList = (schema = 'public') => {
  return axios.get(`/tables/${schema}`)
}

// Get table schema
export const getTableSchema = (schema, tableName) => {
  return axios.get(`/tables/${schema}/${tableName}`)
}

// Get table metadata
export const getTableMetadata = (tableName) => {
  return axios.get(`/tables/${tableName}/metadata`)
}

// Get table data with pagination
export const getTableData = (schema, tableName, params) => {
  return axios.get(`/data/${schema}/${tableName}`, { params })
}

// Get single row
export const getRowById = (tableName, id) => {
  return axios.get(`/data/${tableName}/${id}`)
}

// Create new row
export const createRow = (schema, tableName, data) => {
  return axios.post(`/data/${schema}/${tableName}`, data)
}

// Update row
export const updateRow = (schema, tableName, id, data) => {
  return axios.put(`/data/${schema}/${tableName}/${id}`, data)
}

// Delete row
export const deleteRow = (schema, tableName, id) => {
  return axios.delete(`/data/${schema}/${tableName}/${id}`)
}

