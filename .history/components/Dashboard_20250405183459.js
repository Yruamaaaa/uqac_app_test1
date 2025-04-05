'use client'
import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, loading, router])

  if (loading) {
    return <Loading />
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
      <main className="w-full">
        <Post />
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