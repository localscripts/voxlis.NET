"use client"

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Bubbles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl animate-float-medium"></div>
      <div className="absolute top-1/2 left-3/4 w-80 h-80 bg-green-200/20 dark:bg-green-800/20 rounded-full blur-3xl animate-float-fast"></div>

      {/* Large Floating Bubbles - Enhanced with more green colors */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/12 rounded-full animate-float-slow"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-200/15 rounded-full animate-float-medium"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-lime-200/10 rounded-full animate-float-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-teal-200/14 rounded-full animate-float-fast"></div>
      <div className="absolute bottom-20 right-10 w-28 h-28 bg-green-300/12 rounded-full animate-float-medium"></div>
      <div className="absolute top-60 left-1/3 w-36 h-36 bg-mint-200/8 rounded-full animate-float-slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-emerald-300/16 rounded-full animate-float-fast"></div>
      <div className="absolute top-1/4 left-1/2 w-22 h-22 bg-green-400/10 rounded-full animate-float-medium"></div>

      {/* Additional Large Bubbles */}
      <div className="absolute top-10 right-1/3 w-30 h-30 bg-lime-300/11 rounded-full animate-float-diagonal"></div>
      <div className="absolute bottom-10 left-1/5 w-26 h-26 bg-teal-300/13 rounded-full animate-float-reverse"></div>
      <div className="absolute top-1/2 right-5 w-34 h-34 bg-green-200/9 rounded-full animate-float-circular"></div>
      <div className="absolute bottom-1/4 left-2/3 w-28 h-28 bg-emerald-400/11 rounded-full animate-float-wave"></div>

      {/* Medium Bubbles - More green variants */}
      <div className="absolute top-32 right-1/2 w-12 h-12 bg-emerald-200/20 rounded-full animate-float-fast"></div>
      <div className="absolute bottom-40 left-1/2 w-14 h-14 bg-green-300/18 rounded-full animate-float-slow"></div>
      <div className="absolute top-2/3 left-20 w-10 h-10 bg-lime-300/22 rounded-full animate-float-medium"></div>
      <div className="absolute bottom-60 right-1/3 w-18 h-18 bg-teal-200/16 rounded-full animate-float-fast"></div>
      <div className="absolute top-1/4 right-2/3 w-16 h-16 bg-green-400/14 rounded-full animate-float-diagonal"></div>
      <div className="absolute bottom-1/2 left-1/4 w-13 h-13 bg-emerald-300/19 rounded-full animate-float-reverse"></div>
      <div className="absolute top-3/4 right-1/4 w-15 h-15 bg-mint-300/17 rounded-full animate-float-circular"></div>
      <div className="absolute bottom-1/5 right-2/3 w-11 h-11 bg-lime-400/15 rounded-full animate-float-wave"></div>

      {/* Small Bubbles - Enhanced green palette */}
      <div className="absolute top-16 left-1/4 w-6 h-6 bg-green-400/25 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-80 right-1/4 w-8 h-8 bg-emerald-400/20 rounded-full animate-pulse-medium"></div>
      <div className="absolute bottom-16 left-1/3 w-4 h-4 bg-lime-400/30 rounded-full animate-pulse-fast"></div>
      <div className="absolute top-1/2 right-20 w-5 h-5 bg-teal-400/25 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-10 w-7 h-7 bg-green-500/22 rounded-full animate-pulse-medium"></div>
      <div className="absolute top-3/4 right-1/2 w-6 h-6 bg-emerald-500/28 rounded-full animate-pulse-fast"></div>

      {/* Additional Small Bubbles */}
      <div className="absolute top-1/5 left-3/4 w-5 h-5 bg-mint-400/26 rounded-full animate-pulse-diagonal"></div>
      <div className="absolute bottom-2/3 right-1/5 w-7 h-7 bg-lime-500/24 rounded-full animate-pulse-reverse"></div>
      <div className="absolute top-2/5 left-1/6 w-4 h-4 bg-teal-500/29 rounded-full animate-pulse-circular"></div>
      <div className="absolute bottom-1/6 right-3/4 w-6 h-6 bg-green-600/21 rounded-full animate-pulse-wave"></div>
      <div className="absolute top-4/5 left-2/5 w-5 h-5 bg-emerald-600/27 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-3/5 right-2/5 w-8 h-8 bg-lime-600/23 rounded-full animate-pulse-medium"></div>

      {/* Rotating Elements */}
      <div className="absolute top-1/3 left-1/2 w-24 h-24 border-2 border-blue-300/40 dark:border-blue-600/40 rounded-full animate-spin-slow"></div>
      <div className="absolute bottom-1/3 right-1/2 w-16 h-16 border-2 border-purple-300/40 dark:border-purple-600/40 rounded-full animate-spin-reverse"></div>

      {/* Rotating Rings - Green themed */}
      <div className="absolute top-24 right-40 w-20 h-20 border border-green-300/15 rounded-full animate-spin-slow"></div>
      <div className="absolute bottom-24 left-40 w-16 h-16 border border-emerald-300/20 rounded-full animate-spin-reverse"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-lime-300/12 rounded-full animate-spin-slow"></div>
      <div className="absolute bottom-1/3 right-1/2 w-12 h-12 border border-teal-300/18 rounded-full animate-spin-reverse"></div>
      <div className="absolute top-1/6 right-1/6 w-18 h-18 border border-green-400/16 rounded-full animate-spin-diagonal"></div>
      <div className="absolute bottom-1/6 left-1/6 w-22 h-22 border border-emerald-400/14 rounded-full animate-spin-wave"></div>

      {/* Gradient Orbs - Green spectrum */}
      <div className="absolute top-48 left-1/2 w-32 h-32 bg-gradient-to-br from-green-200/12 to-emerald-200/8 rounded-full animate-float-slow blur-sm"></div>
      <div className="absolute bottom-48 right-1/4 w-28 h-28 bg-gradient-to-br from-lime-200/10 to-teal-200/14 rounded-full animate-float-medium blur-sm"></div>
      <div className="absolute top-1/3 right-10 w-24 h-24 bg-gradient-to-br from-emerald-300/15 to-green-300/10 rounded-full animate-float-fast blur-sm"></div>
      <div className="absolute bottom-1/5 left-1/3 w-30 h-30 bg-gradient-to-br from-mint-200/12 to-lime-200/9 rounded-full animate-float-diagonal blur-sm"></div>
      <div className="absolute top-2/3 right-1/3 w-26 h-26 bg-gradient-to-br from-teal-300/11 to-green-400/13 rounded-full animate-float-reverse blur-sm"></div>

      {/* Tiny Floating Particles */}
      <div className="absolute top-1/8 left-1/8 w-2 h-2 bg-green-500/40 rounded-full animate-float-tiny"></div>
      <div className="absolute top-3/8 right-1/8 w-3 h-3 bg-emerald-500/35 rounded-full animate-float-tiny-reverse"></div>
      <div className="absolute bottom-1/8 left-3/8 w-2 h-2 bg-lime-500/42 rounded-full animate-float-tiny"></div>
      <div className="absolute bottom-3/8 right-3/8 w-3 h-3 bg-teal-500/38 rounded-full animate-float-tiny-reverse"></div>
      <div className="absolute top-5/8 left-5/8 w-2 h-2 bg-mint-500/41 rounded-full animate-float-tiny"></div>
      <div className="absolute bottom-5/8 right-5/8 w-3 h-3 bg-green-600/36 rounded-full animate-float-tiny-reverse"></div>
      <div className="absolute top-7/8 left-7/8 w-2 h-2 bg-emerald-600/39 rounded-full animate-float-tiny"></div>
      <div className="absolute bottom-7/8 right-7/8 w-3 h-3 bg-lime-600/37 rounded-full animate-float-tiny-reverse"></div>

      {/* Moving Trail Bubbles */}
      <div className="absolute top-1/3 left-0 w-8 h-8 bg-green-300/20 rounded-full animate-move-right"></div>
      <div className="absolute top-2/3 right-0 w-6 h-6 bg-emerald-300/18 rounded-full animate-move-left"></div>
      <div className="absolute bottom-1/3 left-0 w-10 h-10 bg-lime-300/16 rounded-full animate-move-right-slow"></div>
      <div className="absolute bottom-2/3 right-0 w-7 h-7 bg-teal-300/19 rounded-full animate-move-left-slow"></div>

      {/* Pulsing Orbs */}
      <div className="absolute top-1/6 right-1/3 w-32 h-32 bg-gradient-to-r from-cyan-300/30 to-blue-300/30 dark:from-cyan-700/30 dark:to-blue-700/30 rounded-full blur-2xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/6 w-48 h-48 bg-gradient-to-r from-pink-300/30 to-purple-300/30 dark:from-pink-700/30 dark:to-purple-700/30 rounded-full blur-2xl animate-pulse-medium"></div>
      <div className="absolute top-2/3 right-1/6 w-40 h-40 bg-gradient-to-r from-yellow-300/30 to-orange-300/30 dark:from-yellow-700/30 dark:to-orange-700/30 rounded-full blur-2xl animate-pulse-fast"></div>

      <style jsx>{`
        /* Enhanced Float Animations */
        @keyframes float-diagonal {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-25px) translateX(20px) rotate(90deg); 
          }
          50% { 
            transform: translateY(-15px) translateX(-25px) rotate(180deg); 
          }
          75% { 
            transform: translateY(-30px) translateX(15px) rotate(270deg); 
          }
        }

        @keyframes float-reverse {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1); 
          }
          33% { 
            transform: translateY(20px) translateX(15px) scale(1.1); 
          }
          66% { 
            transform: translateY(30px) translateX(-20px) scale(0.9); 
          }
        }

        @keyframes float-circular {
          0% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-20px) translateX(20px) rotate(90deg); 
          }
          50% { 
            transform: translateY(0px) translateX(40px) rotate(180deg); 
          }
          75% { 
            transform: translateY(20px) translateX(20px) rotate(270deg); 
          }
          100% { 
            transform: translateY(0px) translateX(0px) rotate(360deg); 
          }
        }

        @keyframes float-wave {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          20% { 
            transform: translateY(-15px) translateX(10px); 
          }
          40% { 
            transform: translateY(-25px) translateX(-5px); 
          }
          60% { 
            transform: translateY(-10px) translateX(-15px); 
          }
          80% { 
            transform: translateY(-20px) translateX(5px); 
          }
        }

        @keyframes float-tiny {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1); 
            opacity: 0.4; 
          }
          50% { 
            transform: translateY(-40px) translateX(-30px) scale(1.5); 
            opacity: 0.8; 
          }
        }

        @keyframes float-tiny-reverse {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(40px) translateX(30px) scale(1.3); 
            opacity: 0.7; 
          }
        }

        /* Enhanced Pulse Animations */
        @keyframes pulse-diagonal {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1) rotate(0deg); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.4) rotate(180deg); 
          }
        }

        @keyframes pulse-reverse {
          0%, 100% { 
            opacity: 0.5; 
            transform: scale(1) translateY(0px); 
          }
          50% { 
            opacity: 0.9; 
            transform: scale(1.6) translateY(-10px); 
          }
        }

        @keyframes pulse-circular {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1) rotate(0deg); 
          }
          33% { 
            opacity: 0.6; 
            transform: scale(1.2) rotate(120deg); 
          }
          66% { 
            opacity: 0.8; 
            transform: scale(1.5) rotate(240deg); 
          }
        }

        @keyframes pulse-wave {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1) skewX(0deg); 
          }
          25% { 
            opacity: 0.6; 
            transform: scale(1.1) skewX(5deg); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.3) skewX(-5deg); 
          }
          75% { 
            opacity: 0.7; 
            transform: scale(1.2) skewX(3deg); 
          }
        }

        /* Enhanced Spin Animations */
        @keyframes spin-diagonal {
          0% { 
            transform: rotate(0deg) translateX(0px) translateY(0px); 
          }
          25% { 
            transform: rotate(90deg) translateX(10px) translateY(-10px); 
          }
          50% { 
            transform: rotate(180deg) translateX(0px) translateY(0px); 
          }
          75% { 
            transform: rotate(270deg) translateX(-10px) translateY(10px); 
          }
          100% { 
            transform: rotate(360deg) translateX(0px) translateY(0px); 
          }
        }

        @keyframes spin-wave {
          0% { 
            transform: rotate(0deg) scale(1); 
          }
          25% { 
            transform: rotate(90deg) scale(1.1); 
          }
          50% { 
            transform: rotate(180deg) scale(0.9); 
          }
          75% { 
            transform: rotate(270deg) scale(1.05); 
          }
          100% { 
            transform: rotate(360deg) scale(1); 
          }
        }

        /* Moving Trail Animations */
        @keyframes move-right {
          0% { 
            transform: translateX(-100px) translateY(0px) scale(0); 
            opacity: 0; 
          }
          10% { 
            transform: translateX(-80px) translateY(-5px) scale(0.5); 
            opacity: 0.5; 
          }
          50% { 
            transform: translateX(50vw) translateY(-10px) scale(1); 
            opacity: 1; 
          }
          90% { 
            transform: translateX(calc(100vw + 80px)) translateY(-5px) scale(0.5); 
            opacity: 0.5; 
          }
          100% { 
            transform: translateX(calc(100vw + 100px)) translateY(0px) scale(0); 
            opacity: 0; 
          }
        }

        @keyframes move-left {
          0% { 
            transform: translateX(100px) translateY(0px) scale(0); 
            opacity: 0; 
          }
          10% { 
            transform: translateX(80px) translateY(5px) scale(0.5); 
            opacity: 0.5; 
          }
          50% { 
            transform: translateX(-50vw) translateY(10px) scale(1); 
            opacity: 1; 
          }
          90% { 
            transform: translateX(calc(-100vw - 80px)) translateY(5px) scale(0.5); 
            opacity: 0.5; 
          }
          100% { 
            transform: translateX(calc(-100vw - 100px)) translateY(0px) scale(0); 
            opacity: 0; 
          }
        }

        @keyframes move-right-slow {
          0% { 
            transform: translateX(-100px) translateY(0px) rotate(0deg); 
            opacity: 0; 
          }
          20% { 
            transform: translateX(-50px) translateY(-8px) rotate(72deg); 
            opacity: 0.6; 
          }
          50% { 
            transform: translateX(50vw) translateY(-15px) rotate(180deg); 
            opacity: 1; 
          }
          80% { 
            transform: translateX(calc(100vw + 50px)) translateY(-8px) rotate(288deg); 
            opacity: 0.6; 
          }
          100% { 
            transform: translateX(calc(100vw + 100px)) translateY(0px) rotate(360deg); 
            opacity: 0; 
          }
        }

        @keyframes move-left-slow {
          0% { 
            transform: translateX(100px) translateY(0px) rotate(0deg); 
            opacity: 0; 
          }
          20% { 
            transform: translateX(50px) translateY(8px) rotate(-72deg); 
            opacity: 0.6; 
          }
          50% { 
            transform: translateX(-50vw) translateY(15px) rotate(-180deg); 
            opacity: 1; 
          }
          80% { 
            transform: translateX(calc(-100vw - 50px)) translateY(8px) rotate(-288deg); 
            opacity: 0.6; 
          }
          100% { 
            transform: translateX(calc(-100vw - 100px)) translateY(0px) rotate(-360deg); 
            opacity: 0; 
          }
        }

        /* Animation Classes */
        .animate-float-diagonal {
          animation: float-diagonal 10s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 9s ease-in-out infinite;
        }

        .animate-float-circular {
          animation: float-circular 12s linear infinite;
        }

        .animate-float-wave {
          animation: float-wave 7s ease-in-out infinite;
        }

        .animate-float-tiny {
          animation: float-tiny 5s ease-in-out infinite;
        }

        .animate-float-tiny-reverse {
          animation: float-tiny-reverse 6s ease-in-out infinite;
        }

        .animate-pulse-diagonal {
          animation: pulse-diagonal 3.5s ease-in-out infinite;
        }

        .animate-pulse-reverse {
          animation: pulse-reverse 2.8s ease-in-out infinite;
        }

        .animate-pulse-circular {
          animation: pulse-circular 4.2s ease-in-out infinite;
        }

        .animate-pulse-wave {
          animation: pulse-wave 3.1s ease-in-out infinite;
        }

        .animate-spin-diagonal {
          animation: spin-diagonal 18s linear infinite;
        }

        .animate-spin-wave {
          animation: spin-wave 16s ease-in-out infinite;
        }

        .animate-move-right {
          animation: move-right 8s linear infinite;
        }

        .animate-move-left {
          animation: move-left 9s linear infinite;
        }

        .animate-move-right-slow {
          animation: move-right-slow 12s linear infinite;
        }

        .animate-move-left-slow {
          animation: move-left-slow 14s linear infinite;
        }
      `}</style>
    </div>
  )
}
