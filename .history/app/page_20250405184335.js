'use client'
import { Fugaz_One } from 'next/font/google'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import Loading from '@/components/Loading'

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] })

export default function Home() {
    const { currentUser, loading } = useAuth()
    const router = useRouter()

    if (loading) {
        return <Loading />
    }

    return (
        <main className="min-h-screen flex flex-col items-center p-4 space-y-8">
            <div className="text-center space-y-6">
                <h1 className={`text-6xl md:text-8xl ${fugaz.className}`}>
                    Shuk
                </h1>
                <p className="text-xl md:text-2xl text-gray-600">
                    helps you find activities
                </p>
                <div className="mt-8">
                    {currentUser ? (
                        <Button
                            text="Go to Dashboard"
                            onClick={() => router.push('/dashboard')}
                            full
                        />
                    ) : (
                        <Button
                            text="Login"
                            onClick={() => router.push('/login')}
                            full
                        />
                    )}
                </div>
            </div>

            <div className="w-full max-w-6xl">
                <WeeklyCalendar />
            </div>
        </main>
    )
}