import api from './api'

export const uploadService = {
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async deleteImage(path) {
    const response = await api.post('/upload/delete-image', { path })
    return response.data
  }
}
