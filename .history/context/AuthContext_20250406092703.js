'use client'
import { auth, db, storage } from '@/firebase'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import React, { useContext, useState, useEffect } from 'react'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [userDataObj, setUserDataObj] = useState(null)
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    // Set mounted state on client-side
    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // AUTH HANDLERS
    async function signup(email, password, userData) {
        console.log('Starting signup process with:', { email, userData })
        try {
            // Create the user account
            console.log('Creating user account...')
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            console.log('User account created:', user.uid)

            // Handle profile image upload if provided
            let profileImageUrl = null
            if (userData?.profileImage) {
                try {
                    console.log('Uploading profile image...')
                    const imageRef = ref(storage, `profile-images/${user.uid}`)
                    await uploadBytes(imageRef, userData.profileImage)
                    profileImageUrl = await getDownloadURL(imageRef)
                    console.log('Profile image uploaded:', profileImageUrl)
                } catch (storageError) {
                    console.error('Error uploading profile image:', storageError)
                    // Continue without the profile image
                }
            }

            // Create user document in Firestore
            console.log('Creating user document in Firestore...')
            const userDoc = {
                email: user.email,
                name: userData?.name || '',
                age: userData?.age || null,
                hobby: userData?.hobby || '',
                profileImage: profileImageUrl,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            try {
                console.log('Attempting to create Firestore document with data:', userDoc)
                const userRef = doc(db, 'users', user.uid)
                await setDoc(userRef, userDoc)
                console.log('User document created in Firestore successfully')
                
                // Verify the document was created
                const docSnap = await getDoc(userRef)
                if (docSnap.exists()) {
                    console.log('Document verified in Firestore:', docSnap.data())
                    // Update local state
                    setCurrentUser(user)
                    setUserDataObj(userDoc)
                } else {
                    console.error('Document was not created in Firestore')
                    throw new Error('Failed to create user document')
                }
                
                return userCredential
            } catch (firestoreError) {
                console.error('Error creating user document:', firestoreError)
                console.error('Firestore error details:', {
                    code: firestoreError.code,
                    message: firestoreError.message,
                    stack: firestoreError.stack
                })
                throw firestoreError // Re-throw to handle in the UI
            }
        } catch (error) {
            console.error('Signup error:', error)
            throw error
        }
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        setUserDataObj(null)
        setCurrentUser(null)
        return signOut(auth)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            try {
                if (!user) {
                    setCurrentUser(null)
                    setUserDataObj(null)
                } else {
                    setCurrentUser(user)
                    // if user exists, fetch data from firestore database
                    const docRef = doc(db, 'users', user.uid)
                    try {
                        const docSnap = await getDoc(docRef)
                        if (docSnap.exists()) {
                            setUserDataObj(docSnap.data())
                        } else {
                            // If document doesn't exist, create it with basic data
                            const userDoc = {
                                email: user.email,
                                name: '',
                                age: null,
                                hobby: '',
                                profileImage: null,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }
                            await setDoc(docRef, userDoc)
                            setUserDataObj(userDoc)
                        }
                    } catch (firestoreError) {
                        console.error('Error accessing user document:', firestoreError)
                        // Set empty user data if there's an error
                        setUserDataObj({
                            email: user.email,
                            name: '',
                            age: null,
                            hobby: '',
                            profileImage: null
                        })
                    }
                }
            } catch (err) {
                console.error('Auth error:', err)
                setCurrentUser(null)
                setUserDataObj(null)
            } finally {
                setLoading(false)
            }
        })
        return unsubscribe
    }, [])

    const value = {
        currentUser,
        userDataObj,
        setUserDataObj,
        signup,
        logout,
        login,
        loading
    }

    // Show loading spinner while initializing
    if (!mounted || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}