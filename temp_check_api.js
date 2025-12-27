const axios = require('axios');
const token = localStorage.getItem('authToken');
axios.get('http://localhost:8000/api/debug/returns', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.error(err.response?.data || err.message));
