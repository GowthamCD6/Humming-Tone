import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/LoginPage/Login.jsx'
import AdminTab from './components/AdminTab/AdminTab.jsx'
import './App.css'

export default function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	const handleLogin = () => {
		setIsAuthenticated(true)
	}

	const handleLogout = () => {
		setIsAuthenticated(false)
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
				
				<Route
					path="/login"
					element={
						isAuthenticated ? (
							<Navigate to="/dashboard" replace />
						) : (
							<Login onSuccess={handleLogin} />
						)
					}
				/>
				
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute isAuthenticated={isAuthenticated}>
							<AdminTab onLogout={handleLogout} />
						</ProtectedRoute>
					}
				/>
				
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}

function ProtectedRoute({ isAuthenticated, children }) {
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return children
}