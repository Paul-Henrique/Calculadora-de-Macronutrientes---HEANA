import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import FoodList from './pages/FoodList';
import Calculator from './pages/Calculator';
import MealPlanner from './pages/MealPlanner';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="alimentos" element={<FoodList />} />
          <Route path="calculadora" element={<Calculator />} />
          <Route path="refeicoes" element={<MealPlanner />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="*" element={<div className="p-4">Página não encontrada</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
