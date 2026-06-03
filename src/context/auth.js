'use client'

import { createContext, useContext, useState, useEffect } from 'react'

var AuthContext = createContext()

export function AuthProvider(_a) {
  var children = _a.children
  var _b = useState(null)
  var user = _b[0]
  var setUser = _b[1]
  var _c = useState([])
  var users = _c[0]
  var setUsers = _c[1]
  var _d = useState({})
  var userProjects = _d[0]
  var setUserProjects = _d[1]
  var _e = useState(false)
  var isLoaded = _e[0]
  var setIsLoaded = _e[1]

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

  function signup(email, password, name) {
    if (users.find(function(u) { return u.email === email })) {
      return { success: false, message: 'Email already exists' }
    }
    
    var newUser = { id: Date.now(), email: email, password: password, name: name }
    setUsers(function(prev) { return prev.concat(newUser) })
    setUserProjects(function(prev) {
      var newData = {}
      for (var key in prev) {
        newData[key] = prev[key]
      }
      newData[email] = []
      return newData
    })
    
    setUser(newUser)
    localStorage.setItem('ai_current_user', email)
    return { success: true, user: newUser }
  }

  function login(email, password) {
    var foundUser = users.find(function(u) { return u.email === email && u.password === password })
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem('ai_current_user', email)
      return { success: true, user: foundUser }
    }
    return { success: false, message: 'Invalid email or password' }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('ai_current_user')
  }

  function saveProject(project) {
    if (!user) return
    
    var newProject = {}
    for (var key in project) {
      newProject[key] = project[key]
    }
    newProject.id = Date.now()
    newProject.savedAt = new Date().toISOString()
    
    setUserProjects(function(prev) {
      var newData = {}
      for (var key in prev) {
        newData[key] = prev[key]
      }
      var list = newData[user.email] || []
      newData[user.email] = list.concat(newProject)
      return newData
    })
  }

  function deleteProject(projectId) {
    if (!user) return
    
    setUserProjects(function(prev) {
      var newData = {}
      for (var key in prev) {
        newData[key] = prev[key]
      }
      var list = newData[user.email] || []
      newData[user.email] = list.filter(function(p) { return p.id !== projectId })
      return newData
    })
  }

  function getUserProjects() {
    if (user && userProjects[user.email]) {
      return userProjects[user.email]
    }
    return []
  }

  function refresh() {
    loadData()
  }

  return (
    <AuthContext.Provider value={{ 
      user: user, 
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