'use client'
import { Fugaz_One } from 'next/font/google'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Loading from '@/components/Loading'
import Calendar from '@/components/Calendar'

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] })

// Dynamically import Button to avoid hydration issues
const Button = dynamic(() => import('@/components/Button'), {
    ssr: false,
    loading: () => <Loading />
})

export default function Home() {
    const { currentUser, loading } = useAuth()
    const router = useRouter()

    if (loading) {
        return <Loading />
    }

    return (
        <main className="min-h-screen flex flex-col items-center p-4 max-w-5xl mx-auto w-full">
            <div className="text-center space-y-4 mb-8 pt-16 md:pt-24">
                <h1 className={`text-4xl md:text-6xl ${fugaz.className}`}>
                    SHUK
                </h1>
                <p className="text-base md:text-lg text-gray-600">
                    Helps you find activities
                </p>
                <div className="mt-4 max-w-xs mx-auto">
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

            <div className="w-full bg-white rounded-xl shadow-sm p-4 transform scale-90">
                <Calendar defaultView="week" />
            </div>
        </main>
    )
}