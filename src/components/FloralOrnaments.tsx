import React from 'react';

export function CamelliaBlossomSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 4C18.5 4 20.5 6.5 20 9.5C22.8 8.2 26 9.8 26.5 12.6C27 15.4 24.5 17.8 21.8 18C24.2 19.8 24.4 23.2 22 25.2C19.6 27.2 16.5 25.8 15.8 23C15.1 25.8 12 27.2 9.6 25.2C7.2 23.2 7.4 19.8 9.8 18C7.1 17.8 4.6 15.4 5.1 12.6C5.6 9.8 8.8 8.2 11.6 9.5C11.1 6.5 13.1 4 16 4Z"
        fill="#F4DFE2"
        stroke="#8C5E4C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="15.8" r="3.2" fill="#E9C39B" stroke="#6F4B3E" strokeWidth="1.4" />
    </svg>
  );
}

export function BotanicalSprigSvg({ className = 'w-28 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 26C38 22 76 14 132 10"
        stroke="#8C6756"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M34 21C29 14 21 13 18 17C22 21 28 22 34 21Z"
        fill="#DCE8D8"
        stroke="#6B7F69"
        strokeWidth="1.2"
      />
      <path
        d="M58 18C55 10 47 9 43 13C47 17 53 19 58 18Z"
        fill="#F4DFE2"
        stroke="#8C5E4C"
        strokeWidth="1.2"
      />
      <path
        d="M84 15C81 8 73 7 69 11C73 15 79 16 84 15Z"
        fill="#DCE8D8"
        stroke="#6B7F69"
        strokeWidth="1.2"
      />
      <path
        d="M46 20C50 26 58 27 62 23C58 19 52 18 46 20Z"
        fill="#DCE8D8"
        stroke="#6B7F69"
        strokeWidth="1.2"
      />
      <path
        d="M74 16C78 22 86 23 90 19C86 15 80 14 74 16Z"
        fill="#F4DFE2"
        stroke="#8C5E4C"
        strokeWidth="1.2"
      />
      <circle cx="108" cy="12" r="4.5" fill="#F4DFE2" stroke="#8C5E4C" strokeWidth="1.2" />
      <circle cx="108" cy="12" r="1.5" fill="#6F4B3E" />
    </svg>
  );
}

export function FloralCornerWatermark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <g opacity="0.32">
        <path
          d="M150 10C132 45 100 88 30 145"
          stroke="#98715C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="112" cy="56" r="16" fill="#F4DFE2" stroke="#8C5E4C" strokeWidth="1.2" />
        <circle cx="112" cy="56" r="5" fill="#D5A886" />
        <circle cx="76" cy="96" r="12" fill="#FFF5EA" stroke="#8C5E4C" strokeWidth="1.2" />
        <circle cx="76" cy="96" r="4" fill="#8C5E4C" />
        <path
          d="M95 72C82 60 66 64 62 74C74 80 86 78 95 72Z"
          fill="#DCE8D8"
          stroke="#6B7F69"
          strokeWidth="1.2"
        />
        <path
          d="M126 82C138 74 152 78 156 88C144 94 134 90 126 82Z"
          fill="#DCE8D8"
          stroke="#6B7F69"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}
