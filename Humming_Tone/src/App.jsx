import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/LoginPage/Login.jsx'
import AdminTab from './components/AdminTab/AdminTab.jsx'
import UserTab from './components/UserTab/UserTab.jsx'
// import PrivacyPolicy from './Pages/SupportsPage/Privacy&Policy/Privacy&Policy.jsx'
import './App.css'
// import PrivacyPolicy from ''

export default function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [userType, setUserType] = useState(null)

	const handleLogin = (type) => {
		setIsAuthenticated(true)
		setUserType(type)
	}

	const handleLogout = () => {
		setIsAuthenticated(false)
		setUserType(null)
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to={isAuthenticated ? (userType === 'admin' ? '/dashboard' : '/usertab') : '/login'} replace />} />
				<Route
					path="/login"
					element={
						isAuthenticated ? (
							<Navigate to={userType === 'admin' ? '/dashboard' : '/usertab'} replace />
						) : (
							<Login onSuccess={handleLogin} />
						)
					}
				/>
				
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute isAuthenticated={isAuthenticated} userType={userType} requiredType="admin">
							<AdminTab onLogout={handleLogout} />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/usertab"
					element={
						<ProtectedRoute isAuthenticated={isAuthenticated} userType={userType} requiredType="user">
							<UserTab onLogout={handleLogout} />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/privacy-policy"
					element={
						<ProtectedRoute isAuthenticated={isAuthenticated} userType={userType} requiredType="user">
							<UserTab onLogout={handleLogout} initialNav="privacy-policy" />
						</ProtectedRoute>
					}
				/>
				
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}

function ProtectedRoute({ isAuthenticated, userType, requiredType, children }) {
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	if (userType !== requiredType) {
		return <Navigate to="/" replace />
	}

	return children
}