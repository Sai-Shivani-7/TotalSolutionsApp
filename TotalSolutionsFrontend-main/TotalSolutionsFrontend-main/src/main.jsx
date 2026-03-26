import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './Components/redux/store.js'
import { Provider } from 'react-redux'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_URL 

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
       <App />
   </Provider>
)
