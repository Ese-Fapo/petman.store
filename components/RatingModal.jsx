'use client'

import { Star, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

const RatingModal = ({ ratingModal, setRatingModal }) => {

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            throw new Error('Please select a rating');
        }
        if (review.length < 5) {
            throw new Error('Write a short review');
        }

        setRatingModal(null);
        return "Rating submitted successfully";
    }

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/10 px-4'>
            <div className='relative w-full max-w-sm rounded-lg bg-white p-5 shadow-lg sm:p-8'>
                <button type="button" onClick={() => setRatingModal(null)} className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-xl font-medium text-slate-600 mb-4'>Rate Product</h2>
                <div className='flex items-center justify-center mb-4'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer ${rating > i ? "text-green-400 fill-current" : "text-gray-300"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400'
                    placeholder='Write your review'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                ></textarea>
                <button type="button" onClick={() => toast.promise(handleSubmit(), {
                    loading: 'Submitting...',
                    success: (message) => message || "Rating submitted successfully",
                    error: (error) => error.message || "Failed to submit rating",
                })} className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition'>
                    Submit Rating
                </button>
            </div>
        </div>
    )
}

export default RatingModal
