'use client'; import React from 'react'; export default function Modal({ children, onClose, title }: any) { return <div className='modal' onClick={onClose}>{title}{children}</div>; }

