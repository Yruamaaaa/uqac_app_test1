'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Loading from '@/components/Loading'
import Post from '@/components/Post'
import { useRouter } from 'next/navigation'
import { db } from '@/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

export default function Dashboard() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, loading, router])

  useEffect(() => {
    if (!currentUser) return

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPosts(postsData)
    })

    return () => unsubscribe()
  }, [currentUser])

  if (loading) {
    return <Loading />
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
      <main className="w-full space-y-6">
        {posts.map(post => (
          <Post key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="text-center text-gray-500">
            No posts yet. Be the first to create one!
          </div>
        )}
      </main>
      <aside className="hidden lg:block sticky top-[73px] h-fit bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-medium text-lg mb-4">Suggested Activities</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div>
              <p className="font-medium">Running Group</p>
              <p className="text-sm text-gray-500">5km morning run</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div>
              <p className="font-medium">Yoga Class</p>
              <p className="text-sm text-gray-500">Evening meditation</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}