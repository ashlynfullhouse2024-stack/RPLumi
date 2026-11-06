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
      <g opacity="0.28">
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

/**
 * Full-screen shadowy floral backdrop ("di belakang screen seperti berbayang")
 * Combines soft blurred botanical photography & delicate camellia/sakura shadow silhouettes
 * fixed behind the entire application viewport.
 */
export function FloralAmbientBackdrop({ imagePath }: { imagePath?: string }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 1: Soft shadowy floral image wash across the screen backdrop */}
      {imagePath && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.13] scale-105 blur-[3px] mix-blend-multiply"
          style={{ backgroundImage: `url('${imagePath}')` }}
        />
      )}

      {/* Layer 2: Warm Choco Latte vignette so foreground cards stay crisp and legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F2]/80 via-[#FDF8F2]/65 to-[#F7EDE2]/85" />

      {/* Layer 3: Top-Right Shadowy Camellia & Sakura Branch Silhouette */}
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-16 -right-16 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] opacity-[0.16] blur-[1px] drop-shadow-[0_14px_24px_rgba(90,57,44,0.22)]"
      >
        {/* Main sweeping branch shadow */}
        <path
          d="M490 20C410 95 320 150 180 190C110 210 55 245 15 290"
          stroke="#5A392C"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M345 130C310 205 260 270 175 340"
          stroke="#5A392C"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Large Camellia Blossom Silhouette 1 */}
        <g transform="translate(280, 70)">
          <path
            d="M50 8C62 8 72 20 69 34C83 28 99 36 101 50C104 64 91 76 77 77C89 86 90 103 78 113C66 123 50 116 47 102C43 116 28 123 16 113C4 103 5 86 17 77C3 76 -9 64 -7 50C-4 36 12 28 26 34C23 20 33 8 50 8Z"
            fill="#6F4B3E"
            fillOpacity="0.45"
            stroke="#4A2E23"
            strokeWidth="2"
          />
          <circle cx="48" cy="64" r="14" fill="#4A2E23" fillOpacity="0.6" />
        </g>
        {/* Medium Blossom Silhouette 2 */}
        <g transform="translate(135, 135) scale(0.78)">
          <path
            d="M50 8C62 8 72 20 69 34C83 28 99 36 101 50C104 64 91 76 77 77C89 86 90 103 78 113C66 123 50 116 47 102C43 116 28 123 16 113C4 103 5 86 17 77C3 76 -9 64 -7 50C-4 36 12 28 26 34C23 20 33 8 50 8Z"
            fill="#8C5E4C"
            fillOpacity="0.4"
            stroke="#4A2E23"
            strokeWidth="2"
          />
          <circle cx="48" cy="64" r="12" fill="#4A2E23" fillOpacity="0.55" />
        </g>
        {/* Blossom 3 on lower sub-branch */}
        <g transform="translate(210, 240) scale(0.68)">
          <path
            d="M50 8C62 8 72 20 69 34C83 28 99 36 101 50C104 64 91 76 77 77C89 86 90 103 78 113C66 123 50 116 47 102C43 116 28 123 16 113C4 103 5 86 17 77C3 76 -9 64 -7 50C-4 36 12 28 26 34C23 20 33 8 50 8Z"
            fill="#6F4B3E"
            fillOpacity="0.38"
            stroke="#4A2E23"
            strokeWidth="2"
          />
          <circle cx="48" cy="64" r="11" fill="#4A2E23" fillOpacity="0.5" />
        </g>
        {/* Botanical Leaves Shadows */}
        <path
          d="M250 155C220 125 185 130 175 150C200 165 230 165 250 155Z"
          fill="#5A392C"
          fillOpacity="0.35"
        />
        <path
          d="M390 95C375 55 340 50 325 70C345 90 370 98 390 95Z"
          fill="#5A392C"
          fillOpacity="0.35"
        />
        <path
          d="M310 215C340 235 375 230 385 210C360 195 330 200 310 215Z"
          fill="#5A392C"
          fillOpacity="0.32"
        />
        {/* Floating shadow petals */}
        <path
          d="M95 260C80 250 65 260 72 275C80 288 98 280 95 260Z"
          fill="#6F4B3E"
          fillOpacity="0.35"
        />
        <path
          d="M150 365C135 355 122 365 128 378C135 390 152 382 150 365Z"
          fill="#6F4B3E"
          fillOpacity="0.3"
        />
      </svg>

      {/* Layer 4: Bottom-Left Shadowy Botanical Silhouette */}
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -bottom-20 -left-16 w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] opacity-[0.14] blur-[1.5px] drop-shadow-[0_-10px_22px_rgba(90,57,44,0.2)]"
      >
        <path
          d="M10 470C95 390 190 330 330 285C395 265 445 230 480 190"
          stroke="#5A392C"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M165 355C205 280 255 215 335 150"
          stroke="#5A392C"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <g transform="translate(120, 290) scale(0.95)">
          <path
            d="M50 8C62 8 72 20 69 34C83 28 99 36 101 50C104 64 91 76 77 77C89 86 90 103 78 113C66 123 50 116 47 102C43 116 28 123 16 113C4 103 5 86 17 77C3 76 -9 64 -7 50C-4 36 12 28 26 34C23 20 33 8 50 8Z"
            fill="#6F4B3E"
            fillOpacity="0.45"
            stroke="#4A2E23"
            strokeWidth="2"
          />
          <circle cx="48" cy="64" r="13" fill="#4A2E23" fillOpacity="0.55" />
        </g>
        <g transform="translate(260, 195) scale(0.75)">
          <path
            d="M50 8C62 8 72 20 69 34C83 28 99 36 101 50C104 64 91 76 77 77C89 86 90 103 78 113C66 123 50 116 47 102C43 116 28 123 16 113C4 103 5 86 17 77C3 76 -9 64 -7 50C-4 36 12 28 26 34C23 20 33 8 50 8Z"
            fill="#8C5E4C"
            fillOpacity="0.4"
            stroke="#4A2E23"
            strokeWidth="2"
          />
          <circle cx="48" cy="64" r="11" fill="#4A2E23" fillOpacity="0.5" />
        </g>
        <path
          d="M240 325C270 355 305 350 315 330C290 315 260 315 240 325Z"
          fill="#5A392C"
          fillOpacity="0.35"
        />
        <path
          d="M195 245C165 220 130 225 120 245C145 260 175 258 195 245Z"
          fill="#5A392C"
          fillOpacity="0.32"
        />
      </svg>

      {/* Layer 5: Subtle Center-Left Floating Blossom Shadow */}
      <svg
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden md:block absolute top-[38%] left-[4%] w-48 h-48 opacity-[0.09] blur-[2px]"
      >
        <g transform="translate(50, 45) scale(1.1)">
          <path
            d="M50 8C62 8 72 20 69 34C83 28 99 36 101 50C104 64 91 76 77 77C89 86 90 103 78 113C66 123 50 116 47 102C43 116 28 123 16 113C4 103 5 86 17 77C3 76 -9 64 -7 50C-4 36 12 28 26 34C23 20 33 8 50 8Z"
            fill="#5A392C"
          />
        </g>
      </svg>
    </div>
  );
}

