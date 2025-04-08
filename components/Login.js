'use client'
import { Fugaz_One } from 'next/font/google';
import React, { useState } from 'react'
import Button from './Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isValidUQACEmail, getEmailDomainError } from '@/utils/emailValidation'

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

const ACTIVITIES = [
    // Sports
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'table-tennis', label: 'Table Tennis' },
    { value: 'running', label: 'Running' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'hiking', label: 'Hiking' },
    { value: 'rock-climbing', label: 'Rock Climbing' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'gym', label: 'Gym' },
    { value: 'martial-arts', label: 'Martial Arts' },
    { value: 'golf', label: 'Golf' },
    { value: 'skateboarding', label: 'Skateboarding' },
    { value: 'surfing', label: 'Surfing' },
    { value: 'skiing', label: 'Skiing' },
    { value: 'snowboarding', label: 'Snowboarding' },
    // Social Activities
    { value: 'eating-out', label: 'Eating Out' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'movie', label: 'Movie' },
    { value: 'concert', label: 'Concert' },
    { value: 'party', label: 'Party' },
    { value: 'board-games', label: 'Board Games' },
    { value: 'video-games', label: 'Video Games' },
    { value: 'karaoke', label: 'Karaoke' },
    { value: 'dancing', label: 'Dancing' },
    { value: 'art-exhibition', label: 'Art Exhibition' },
    { value: 'museum', label: 'Museum' },
    { value: 'shopping', label: 'Shopping' },
    // Outdoor Activities
    { value: 'picnic', label: 'Picnic' },
    { value: 'camping', label: 'Camping' },
    { value: 'fishing', label: 'Fishing' },
    { value: 'kayaking', label: 'Kayaking' },
    { value: 'paddleboarding', label: 'Paddleboarding' },
    { value: 'photography', label: 'Photography' },
    { value: 'bird-watching', label: 'Bird Watching' },
    { value: 'gardening', label: 'Gardening' },
    // Learning & Development
    { value: 'language-exchange', label: 'Language Exchange' },
    { value: 'book-club', label: 'Book Club' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'study-group', label: 'Study Group' },
    { value: 'cooking-class', label: 'Cooking Class' },
    { value: 'art-class', label: 'Art Class' },
    { value: 'music-lesson', label: 'Music Lesson' },
    // Wellness & Health
    { value: 'meditation', label: 'Meditation' },
    { value: 'massage', label: 'Massage' },
    { value: 'spa', label: 'Spa' },
    { value: 'wellness-retreat', label: 'Wellness Retreat' },
    { value: 'nutrition-workshop', label: 'Nutrition Workshop' }
];

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [hobbies, setHobbies] = useState([])
    const [profileImage, setProfileImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isRegister, setIsRegister] = useState(false)
    const [authenticating, setAuthenticating] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const { signup, login } = useAuth()

    const optimizeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();  // Use window.Image to avoid conflict with Next.js Image
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate new dimensions (max 800px width/height)
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 800;
                    
                    if (width > height && width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with compression
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                // Create a new file from the blob
                                const optimizedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                resolve(optimizedFile);
                            } else {
                                reject(new Error('Failed to optimize image'));
                            }
                        },
                        'image/jpeg',
                        0.7 // Compression quality (0.7 = 70% quality)
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            try {
                // Optimize the image before setting state
                const optimizedFile = await optimizeImage(file);
                setProfileImage(optimizedFile);
                setPreviewUrl(URL.createObjectURL(optimizedFile));
            } catch (error) {
                console.error('Error optimizing image:', error);
                setError('Failed to process image. Please try again.');
            }
        }
    }

    const handleHobbyChange = (activity) => {
        setHobbies(prev => {
            if (prev.includes(activity)) {
                return prev.filter(h => h !== activity);
            } else if (prev.length < 6) {
                return [...prev, activity];
            }
            return prev;
        });
    };

    async function handleSubmit(e) {
        e?.preventDefault()
        
        // Validate email domain for registration
        if (isRegister) {
            const emailError = getEmailDomainError(email)
            if (emailError) {
                setError(emailError)
                return
            }
        }

        if (!email || !password || password.length < 6) {
            setError('Please enter valid credentials')
            return
        }
        if (isRegister && (!name || !age || hobbies.length === 0)) {
            setError('Please fill in all required fields')
            return
        }
        setError('')
        setAuthenticating(true)
        try {
            if (isRegister) {
                await signup(email, password, {
                    name,
                    age: parseInt(age),
                    hobbies,
                    profileImage
                })
            } else {
                await login(email, password)
            }
            // Wait a bit for the auth state to update
            setTimeout(() => {
                router.push('/dashboard')
            }, 500)
        } catch (err) {
            console.error('Login error:', err)
            setError('Authentication failed. Please try again.')
        } finally {
            setAuthenticating(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 justify-center items-center gap-4 w-full max-w-[400px] mx-auto px-4'>
            <h3 className={'text-4xl sm:text-5xl md:text-6xl ' + fugaz.className}>
                {isRegister ? 'Register' : 'Log In'}
            </h3>
            <p>You&#39;re one step away!</p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 duration-200 hover:border-black focus:border-black py-2 sm:py-3 border border-solid border-black rounded-full outline-none' 
                placeholder='Email'
                type="email"
                required
            />
            <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 duration-200 hover:border-black focus:border-black py-2 sm:py-3 border border-solid border-black rounded-full outline-none' 
                placeholder='Password' 
                type='password'
                required
                minLength={6}
            />

            {isRegister && (
                <>
                    <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className='w-full px-3 duration-200 hover:border-black focus:border-black py-2 sm:py-3 border border-solid border-black rounded-full outline-none' 
                        placeholder='Full Name'
                        type="text"
                        required
                    />
                    <input 
                        value={age} 
                        onChange={(e) => setAge(e.target.value)}
                        className='w-full px-3 duration-200 hover:border-black focus:border-black py-2 sm:py-3 border border-solid border-black rounded-full outline-none' 
                        placeholder='Age'
                        type="number"
                        min="13"
                        required
                    />
                    
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Favorite Sports/Hobbies (Select up to 6)
                        </label>
                        <div className="space-y-2">
                            <select
                                value=""
                                onChange={(e) => {
                                    if (e.target.value && hobbies.length < 6) {
                                        setHobbies(prev => [...prev, e.target.value]);
                                    }
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select a hobby...</option>
                                {ACTIVITIES.map(activity => (
                                    <option 
                                        key={activity.value} 
                                        value={activity.value}
                                        disabled={hobbies.includes(activity.value)}
                                    >
                                        {activity.label}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Selected Hobbies */}
                            <div className="flex flex-wrap gap-2">
                                {hobbies.map(hobby => {
                                    const activity = ACTIVITIES.find(a => a.value === hobby);
                                    return (
                                        <div 
                                            key={hobby}
                                            className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                                        >
                                            <span>{activity?.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => setHobbies(prev => prev.filter(h => h !== hobby))}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {hobbies.length > 0 && (
                                <p className="text-sm text-gray-500">
                                    Selected: {hobbies.length}/6
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <p className="text-sm text-gray-600">Profile Picture</p>
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Profile preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-gray-400">
                                        <i className="fa-solid fa-user text-2xl"></i>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-black file:text-white hover:file:bg-gray-800"
                            />
                        </div>
                    </div>
                </>
            )}

            <div className='w-full'>
                <Button 
                    type="submit"
                    text={authenticating ? 'Please wait...' : "Submit"} 
                    full 
                />
            </div>
            
            <p className="text-center">
                {isRegister ? 'Already have an account? ' : 'Don\'t have an account? '}
                <button 
                    type="button"
                    onClick={() => setIsRegister(!isRegister)} 
                    className='text-blue-600'
                >
                    {isRegister ? 'Sign in' : 'Sign up'}
                </button>
            </p>
        </form>
    )
}