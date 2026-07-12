"use client"
import React from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react"

const Navbar = () => {

   const { data: session } = useSession()
  
  return (

    <div className="text-gray-60 bg-black body-font  sticky top-0 z-50  backdrop-blur-md ">
      <div className="w-full px-8 flex flex-col md:flex-row items-center justify-between">
        <a className="flex title-font  font-medium items-center text-gray-900 mb-4 md:mb-0">
          <svg className="text-white"
            width="250"
            height="55"
            viewBox="0 0 300 80"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="monetraTitle2"
          >
            <title id="monetraTitle2">Monetra - Continuous Support</title>

            <defs>
              <linearGradient
                id="growthGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>

            <g id="loopIcon" transform="translate(10, 10)">
              <path
                d="M 20 50 L 20 25 C 20 12, 32 12, 38 22 C 44 12, 56 12, 56 25 L 56 50 C 56 62, 38 65, 38 45 C 38 65, 20 62, 20 50 Z"
                fill="none"
                stroke="url(#growthGradient)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="38" cy="22" r="3.5" fill="#06B6D4" />
            </g>

            <g transform="translate(85, 48)">
              <text
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="38"
                fontWeight="800"
                fill="currentColor"
                letterSpacing="-0.5px"
              >
                monetra
              </text>
              <text
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="10"
                fontWeight="700"
                fill="currentColor"
                transform="translate(2, 15)"
                letterSpacing="2.5px"
              >
                SUSTAINABLE GIVING
              </text>
            </g>
          </svg>
         
        </a>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
  <Link href="/" className="text-gray-100 font-medium mr-6 hover:text-emerald-400 transition-colors">
    Home
  </Link>
  <Link href="/donate" className="text-gray-100 font-medium mr-6 hover:text-emerald-400 transition-colors">
    Donate
  </Link>
  <Link href="/fundraise" className="text-gray-100 font-medium mr-6 hover:text-emerald-400 transition-colors">
    Fundraise
  </Link>

  {session ? (
    <>
      <Link href="/profile">
        <img
          src={session.user.image}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-white cursor-pointer hover:scale-105 transition mr-3"
        />
      </Link>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex items-center text-black font-medium bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0"
      >
        Logout
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="w-4 h-4 ml-1"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </button>
    </>
  ) : (
    <Link href="/login">
      <button className="inline-flex items-center text-black font-medium bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
        Login
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="w-4 h-4 ml-1"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </button>
    </Link>
  )}
</nav>
        {/* <button className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
          Button
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="w-4 h-4 ml-1"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </button> */}
      </div>
    </div>
  );
};

export default Navbar;