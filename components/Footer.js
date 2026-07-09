import React from "react";

const Footer = () => {
  return (
    <footer className="text-gray-60 body-font py-2">
      <div className="container px-5 mx-auto flex items-center sm:flex-row flex-col">
        <a
          href="/"
          className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900"
        >
          <svg className="text-white"
            width="150"
            height="35"
            viewBox="0 0 300 80"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="monetraTitle2"
          >
            <title id="monetraTitle2">
              Monetra - Continuous Support
            </title>

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

            <g transform="translate(10, 10)">
              <path
                d="M 20 50 L 20 25 C 20 12, 32 12, 38 22 C 44 12, 56 12, 56 25 L 56 50 C 56 62, 38 65, 38 45 C 38 65, 20 62, 20 50 Z"
                fill="none"
                stroke="url(#growthGradient)"
                strokeWidth={7}
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
                letterSpacing={-0.5}
              >
                monetra
              </text>

              <text
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="10"
                fontWeight="700"
                fill="currentColor"
                transform="translate(2, 15)"
                letterSpacing={2.5}
              >
                SUSTAINABLE GIVING
              </text>
            </g>
          </svg>
        </a>

        <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
          © 2020 Monetra —
          <a
            href="https://twitter.com/knyttneve"
            className="text-gray-600 ml-1"
            rel="noopener noreferrer"
            target="_blank"
          >
            @satishk
          </a>
        </p>

        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          <a href="#" className="text-gray-500">
            <svg
              fill="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </a>

          <a href="#" className="ml-3 text-gray-500">
            <svg
              fill="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>

          <a href="#" className="ml-3 text-gray-500">
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <rect
                width="20"
                height="20"
                x="2"
                y="2"
                rx="5"
                ry="5"
              />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
            </svg>
          </a>

          <a href="#" className="ml-3 text-gray-500">
            <svg
              fill="currentColor"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={0}
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path
                stroke="none"
                d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
              />
              <circle cx="4" cy="4" r="2" stroke="none" />
            </svg>
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;