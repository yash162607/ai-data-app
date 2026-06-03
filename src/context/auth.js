'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [userProjects, setUserProjects] = useState({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load everything on startup
  useEffect(function() {
    loadData()
  }, [])

  function loadData() {
    try {
      var savedUsers = localStorage.getItem('ai_users')
      var savedProjects = localStorage.getItem('ai_projects')
      var savedCurrentUser = localStorage.getItem('ai_current_user')
      
      var allUsers = []
      if (savedUsers) {
        allUsers = JSON.parse(savedUsers)
        setUsers(allUsers)
      }
      
      if (savedProjects) {
        setUserProjects(JSON.parse(savedProjects))
      }
      
      // Restore logged in user
      if (savedCurrentUser && allUsers.length > 0) {
        var currentUser = allUsers.find(function(u) { return u.email === savedCurrentUser })
        if (currentUser) {
          setUser(currentUser)
        }
      }
    } catch (e) {
      console.log('Error loading data:', e)
    }
    
    setIsLoaded(true)
  }

  // Save when data changes
  useEffect(function() {
    if (isLoaded) {
      localStorage.setItem('ai_users', JSON.stringify(users))
    }
  }, [users, isLoaded])

  useEffect(function() {
    if (isLoaded) {
      localStorage.setItem('ai_projects', JSON.stringify(userProjects))
    }
  }, [userProjects, isLoaded])

  const signup = function(email, password, name) {
    if (users.find(function(u) { return u.email === email })) {
      return { success: false, message: 'Email already exists' }
    }
    
    var newUser = { id: Date.now(), email: email, password: password, name: name }
    setUsers(function(prev) { return [...prev, newUser] })
    setUserProjects(function(prev) {
      var newData = Object.assign({}, prev)
      newData[email] = []
      return newData
    })
    
    setUser(newUser)
    localStorage.setItem('ai_current_user', email)
    return { success: true, user: newUser }
  }

  const login = function(email, password) {
    var foundUser = users.find(function(u) { return u.email === email && u.password === password })
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem('ai_current_user', email)
      return { success: true, user: foundUser }
    }
    return { success: false, message: 'Invalid email or password' }
  }

  const logout = function() {
    setUser(null)
    // Keep data but remove current user session
    localStorage.removeItem('ai_current_user')
  }

  const saveProject = function(project) {
    if (!user) return
    
    var newProject = Object.assign({
      id: Date.now(),
      savedAt: new Date().toISOString()
    }, project)
    
    setUserProjects(function(prev) {
      var list = prev[user.email] || []
      return Object.assign({}, prev, {
        [user.email]: [...list, newProject]
      })
    })
  }

  const deleteProject = function(projectId) {
    if (!user) return
    
    setUserProjects(function(prev) {
      var list = prev[user.email] || []
      var updated = list.filter(function(p) { return p.id !== projectId })
      return Object.assign({}, prev, {
        [user.email]: updated
      })
    })
  }

  const getUserProjects = function() {
    if (user && userProjects[user.email]) {
      return userProjects[user.email]
    }
    return []
  }

  // Force refresh
  const refresh = function() {
    loadData()
  }

  return (
    <AuthContext.Provider value={{ 
      user: user, 
      users: users,
      signup: signup, 
      login: login, 
      logout: logout,
      saveProject: saveProject,
      deleteProject: deleteProject,
      getUserProjects: getUserProjects,
      refresh: refresh,
      isLoaded: isLoaded
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}