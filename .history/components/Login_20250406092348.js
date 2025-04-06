'use client'
import { Fugaz_One } from 'next/font/google';
import React, { useState } from 'react'
import Button from './Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [hobby, setHobby] = useState('')
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

    async function handleSubmit(e) {
        e?.preventDefault()
        if (!email || !password || password.length < 6) {
            setError('Please enter valid credentials')
            return
        }
        if (isRegister && (!name || !age || !hobby)) {
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
                    hobby,
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
                    <input 
                        value={hobby} 
                        onChange={(e) => setHobby(e.target.value)}
                        className='w-full px-3 duration-200 hover:border-black focus:border-black py-2 sm:py-3 border border-solid border-black rounded-full outline-none' 
                        placeholder='Favorite Sport/Hobby'
                        type="text"
                        required
                    />
                    <div className="w-full space-y-2">
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
            <p className='text-center'>
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