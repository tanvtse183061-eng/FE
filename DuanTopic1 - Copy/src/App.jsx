
import './styles/globals.css'
import HomePage from './Pages/HomePage';
import Login from './Pages/Login/Login';
import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dealerstaff from './Pages/DealerStaff/Dealerstaff';
import Dashboard from './Pages/DealerStaff/Dashboard';
import Customer from './Pages/DealerStaff/Customer';
import Order from './Pages/DealerStaff/Order';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          
          <Route path="/home" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          <Route path='/dealerstaff' element={
             <Dealerstaff />
          }>
            <Route path='dashboard' element={<Dashboard />}/>
            <Route path='customer' element={<Customer />} />
            <Route path='order' element = {<Order />} />
          </Route>
          
        </Routes>
        
      </BrowserRouter>
    </div>
  )
}

export default App
