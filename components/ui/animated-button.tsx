"use client"

import { motion } from "framer-motion"
import { Button } from "./button"
import { forwardRef, type ReactNode, type MouseEventHandler } from "react"
import { type VariantProps } from "class-variance-authority"
import { type buttonVariants } from "./button"

interface AnimatedButtonProps extends VariantProps<typeof buttonVariants> {
  animationType?: "bounce" | "scale" | "pulse" | "wiggle"
  children?: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ animationType = "bounce", children, onClick, ...props }, ref) => {
    const animations = {
      bounce: {
        whileHover: { 
          scale: 1.05,
          y: -2,
          transition: { 
            type: "spring" as const, 
            stiffness: 300, 
            damping: 10 
          }
        },
        whileTap: { 
          scale: 0.98,
          y: 0,
          transition: { 
            type: "spring" as const, 
            stiffness: 400, 
            damping: 15 
          }
        }
      },
      scale: {
        whileHover: { 
          scale: 1.08,
          transition: { 
            type: "spring" as const, 
            stiffness: 200, 
            damping: 8 
          }
        },
        whileTap: { 
          scale: 0.95,
          transition: { 
            type: "spring" as const, 
            stiffness: 300, 
            damping: 12 
          }
        }
      },
      pulse: {
        whileHover: { 
          scale: [1, 1.05, 1],
          transition: { 
            duration: 0.8,
            repeat: Infinity,
            repeatType: "loop" as const
          }
        },
        whileTap: { scale: 0.98 }
      },
      wiggle: {
        whileHover: { 
          rotate: [0, -2, 2, -2, 2, 0],
          transition: { 
            duration: 0.5,
            repeat: Infinity,
            repeatType: "loop" as const
          }
        },
        whileTap: { scale: 0.95 }
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...animations[animationType]}
      >
        <Button
          ref={ref}
          onClick={onClick}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
