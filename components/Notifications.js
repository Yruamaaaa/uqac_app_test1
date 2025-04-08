'use client'
import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Notifications() {
    const { currentUser } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (!currentUser) return

        const notificationsRef = collection(db, 'notifications')
        const q = query(
            notificationsRef,
            where('userId', '==', currentUser.uid),
            where('read', '==', false)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newNotifications = []
            snapshot.forEach(doc => {
                newNotifications.push({
                    id: doc.id,
                    ...doc.data()
                })
            })
            setNotifications(newNotifications)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    const handleNotificationClick = async (notification) => {
        // Mark notification as read
        await updateDoc(doc(db, 'notifications', notification.id), {
            read: true
        })

        // Navigate to the event
        if (notification.type === 'event_match') {
            router.push(`/event-research?event=${notification.eventId}`)
        }
    }

    if (!currentUser || notifications.length === 0) return null

    return (
        <div className="fixed bottom-20 right-4 z-50">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="bg-white rounded-lg shadow-lg p-4 mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <p className="text-sm font-medium">
                        Nouvel événement correspondant à vos intérêts !
                    </p>
                    <p className="text-xs text-gray-500">
                        {notification.eventTitle}
                    </p>
                </div>
            ))}
        </div>
    )
} 