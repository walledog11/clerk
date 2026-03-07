
import { Bot } from "lucide-react";

import Image from "next/image";

export default function HeroGraphic ({ className, ...props }: React.ComponentProps<"div">) {
    return (
    <div className="relative w-full aspect-[400/420]">
            {/* Dashed connecting lines with animated dots */}
            <svg
              className="absolute inset-0 z-0 w-full h-full"
              viewBox="0 0 400 420"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
            >
              {/* Gmail → Center */}
              <path
                d="M110 90 L200 210"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                vectorEffect="non-scaling-stroke"
              />
              <circle r="4" fill="#FACC15">
                <animateMotion
                  dur="2.5s"
                  repeatCount="indefinite"
                  path="M110 90 L200 210"
                />
              </circle>

              {/* Shopify → Center */}
              <path
                d="M310 80 L200 210"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                vectorEffect="non-scaling-stroke"
              />
              <circle r="4" fill="#FACC15">
                <animateMotion
                  dur="2.8s"
                  repeatCount="indefinite"
                  path="M310 80 L200 210"
                />
              </circle>

              {/* Instagram → Center */}
              <path
                d="M110 340 L200 210"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                vectorEffect="non-scaling-stroke"
              />
              <circle r="4" fill="#FACC15">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path="M110 340 L200 210"
                />
              </circle>

              {/* TikTok → Center */}
              <path
                d="M310 345 L200 210"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                vectorEffect="non-scaling-stroke"
              />
              <circle r="4" fill="#FACC15">
                <animateMotion
                  dur="2.6s"
                  repeatCount="indefinite"
                  path="M310 345 L200 210"
                />
              </circle>
            </svg>

            <div className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] max-w-44 aspect-square rounded-3xl border-4 border-yellow-400 bg-white flex items-center justify-center shadow-lg">
              <Bot className="text-yellow-400 w-[55%] h-[55%]"/>
            </div>

            <div className="absolute z-10 left-[27.5%] top-[21.4%] -translate-x-1/2 -translate-y-1/2 w-[18%] max-w-20 aspect-square drop-shadow-lg flex items-center justify-center">
              <Image src="/logos/gmail.png" width={100} height={100} alt="gmail-logo"/>
            </div>

            <div className="absolute z-10 left-[77.5%] top-[19%] -translate-x-1/2 -translate-y-1/2 w-[18%] max-w-20 aspect-square drop-shadow-lg flex items-center justify-center">
              <Image src="/logos/shopify-inbox.png" width={100} height={100} alt="shopify-inbox-logo"/>
            </div>

            <div className="absolute z-10 left-[27.5%] top-[81%] -translate-x-1/2 -translate-y-1/2 w-[18%] max-w-20 aspect-square drop-shadow-lg flex items-center justify-center overflow-hidden">
              <Image src="/logos/instagram-logo.png" width={100} height={100} alt="instagram-logo"/>
            </div>

            <div className="absolute z-10 left-[77.5%] top-[82.1%] -translate-x-1/2 -translate-y-1/2 w-[18%] max-w-20 aspect-square drop-shadow-lg flex items-center justify-center">
              <Image src="/logos/tiktok-logo.png" width={100} height={100} alt="tiktok-logo"/>
            </div>

          </div>
          )
}

