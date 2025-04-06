import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/firebase'

export const XP_PER_LEVEL = 100
export const XP_REWARD_EVENT = 20
export const XP_REWARD_PARTNER = 20

export async function addXP(userId, xpAmount) {
    try {
        const userRef = doc(db, 'users', userId)
        
        // Get current XP and level
        const currentXP = (await getDoc(userRef)).data().xp
        const currentLevel = (await getDoc(userRef)).data().level
        
        // Calculate new XP and level
        const newXP = currentXP + xpAmount
        const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
        
        // Update user document
        await updateDoc(userRef, {
            xp: increment(xpAmount),
            level: newLevel > currentLevel ? newLevel : currentLevel,
            updatedAt: new Date().toISOString()
        })
        
        return { newXP, newLevel }
    } catch (error) {
        console.error('Error adding XP:', error)
        throw error
    }
}

export function calculateLevel(xp) {
    return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function calculateXPProgress(xp) {
    return xp % XP_PER_LEVEL
} 