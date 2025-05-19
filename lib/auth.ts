import type { UserType } from "./types"

// In a real application, this would be a database or API call
// For this demo, we'll use localStorage to simulate user authentication

// Function to register a new user
export async function registerUser(userData: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<UserType> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("Cannot register user on the server")
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get existing users from localStorage
  const usersJson = localStorage.getItem("credentials") || "[]"
  const users = JSON.parse(usersJson)

  // Check if user already exists
  const existingUser = users.find((user: UserType) => user.email === userData.email)
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Create new user
  const newUser: UserType = {
    id: Date.now().toString(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password, // In a real app, this would be hashed
  }

  // Add user to "database"
  users.push(newUser)
  localStorage.setItem("credentials", JSON.stringify(users))

  // Return user without password
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword as UserType
}

// Function to sign in a user
export async function signInUser(credentials: { email: string; password: string }): Promise<UserType> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("Cannot sign in user on the server")
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get users from localStorage
  const usersJson = localStorage.getItem("credentials") || "[]"
  const users = JSON.parse(usersJson)

  // Find user with matching email and password
  const user = users.find(
    (user: UserType) => user.email === credentials.email && user.password === credentials.password,
  )

  if (!user) {
    throw new Error("Invalid email or password")
  }

  // Store current user in localStorage
  const { password, ...userWithoutPassword } = user
  localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

  return userWithoutPassword as UserType
}

// Function to get the current user
export async function getCurrentUser(): Promise<UserType | null> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return null
  }

  // Get current user from localStorage
  const userJson = localStorage.getItem("currentUser")
  if (!userJson) {
    return null
  }

  return JSON.parse(userJson) as UserType
}

// Function to sign out the current user
export async function signOutUser(): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return
  }

  // Remove current user from localStorage
  localStorage.removeItem("currentUser")
}
