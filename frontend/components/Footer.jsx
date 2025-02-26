import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer
        className='flex h-8 border-t border-[#FFFFFF33] bg-primaryDarkBlue items-center justify-center z-40'
    >
        <div
            className='text-[#D6DDE6] text-sm font-plusjakarta [word-spacing:3px]'
        >
            Made with &hearts; by <Link href={`https://linkedin.com/in/prateekjain6342`} className='hover:text-secondaryGreen'>Prateek</Link> in India
        </div>
    </footer>
  )
}

export default Footer