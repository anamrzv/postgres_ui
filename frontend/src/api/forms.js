import axios from './axios'

// Send project
export const sendNewProject = (params) => {
  return axios.post('/forms/new_project', params)
}

// Get full names from developers table
export const getFullNames = () => {
  return axios.get('/forms/full_names')
}

// Get project names from projects table
export const getProjectNames = () => {
  return axios.get('/forms/project_names')
}