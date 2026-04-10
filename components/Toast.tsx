'use client'; import React from 'react'; export default function Toast({ message, onClose }: any) { return <div className='toast' onClick={onClose}>{message}</div>; }

