import { db } from '@/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

export async function sendEventNotifications(eventData) {
    try {
        // Get all users who have matching hobbies
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('hobbies', 'array-contains-any', [eventData.activityType]))
        const usersSnapshot = await getDocs(q)

        // Create notifications for each matching user
        const notifications = []
        usersSnapshot.forEach(userDoc => {
            // Don't notify the event creator
            if (userDoc.id !== eventData.authorId) {
                notifications.push({
                    userId: userDoc.id,
                    type: 'event_match',
                    eventId: eventData.id,
                    eventTitle: eventData.title,
                    eventActivity: eventData.activityType,
                    createdAt: serverTimestamp(),
                    read: false
                })
            }
        })

        // Batch add notifications
        if (notifications.length > 0) {
            const notificationsRef = collection(db, 'notifications')
            for (const notification of notifications) {
                await addDoc(notificationsRef, notification)
            }
        }
    } catch (error) {
        console.error('Error sending notifications:', error)
    }
} 