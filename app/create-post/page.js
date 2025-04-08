import { validateFormContent } from '@/utils/contentModeration'

const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate content
    const contentValidation = validateFormContent({
        title,
        content
    })
    
    if (!contentValidation.isValid) {
        setErrors(contentValidation.errors)
        return
    }

    // ... rest of the existing handleSubmit code ...
} 