"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, ArrowUp, ArrowDown, User, Calendar, Tag, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ModernIdeaCardProps {
  idea: {
    id: string
    title: string
    description: string
    category: string
    tags: string[]
    upvotes: number
    downvotes: number
    wantsTeam: boolean
    neededSkills: string[]
    createdAt: Date
    author: {
      id: string
      name: string | null
      username: string | null
      image: string | null
      skills: string[]
    }
    _count: {
      comments: number
      votes: number
      interests: number
    }
  }
  currentUserId?: string
  onVote?: (ideaId: string, type: "UP" | "DOWN") => void
  onInterest?: (ideaId: string) => void
  className?: string
}

const ModernIdeaCard = React.forwardRef<HTMLDivElement, ModernIdeaCardProps>(
  ({
    idea,
    currentUserId,
    onVote,
    onInterest,
    className,
    ...props
  }, _ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [userVote, setUserVote] = React.useState<"UP" | "DOWN" | null>(null)
    const [isInterested, setIsInterested] = React.useState(false)
    const cardRef = React.useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })

    const handleVote = (type: "UP" | "DOWN") => {
      if (!currentUserId) return
      
      const newVote = userVote === type ? null : type
      setUserVote(newVote)
      onVote?.(idea.id, type)
    }

    const handleInterest = () => {
      if (!currentUserId) return
      
      setIsInterested(!isInterested)
      onInterest?.(idea.id)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        setMousePosition({ x, y })
      }
    }

    const getCategoryColor = (category: string) => {
      const colors = {
        SAAS: "from-blue-500 to-cyan-500",
        MOBILE_APP: "from-green-500 to-emerald-500", 
        WEB_APP: "from-yellow-500 to-orange-500",
        HARDWARE: "from-red-500 to-pink-500",
        SERVICE: "from-purple-500 to-violet-500",
        OTHER: "from-gray-500 to-slate-500",
      }
      return colors[category as keyof typeof colors] || "from-gray-500 to-slate-500"
    }

    const formatDate = (date: Date) => {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        'day'
      )
    }

    return (
      <motion.div
        ref={cardRef}
        className={cn(
          "relative group cursor-pointer",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {/* Background gradient container */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          animate={{
            rotateX: isHovered ? (mousePosition.y / 20) : 0,
            rotateY: isHovered ? -(mousePosition.x / 20) : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        >
          {/* Animated gradient background */}
          <motion.div
            className={cn(
              "absolute inset-0 opacity-70 bg-gradient-to-br",
              getCategoryColor(idea.category)
            )}
            animate={{
              opacity: isHovered ? 0.8 : 0.1
            }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: isHovered
                ? `0 25px 50px -12px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.1)`
                : "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Card content */}
        <motion.div
          className="relative bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 h-full"
          animate={{
            y: isHovered ? -8 : 0,
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={idea.author.image ?? undefined} alt={idea.author.name ?? "User"} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {idea.author.name ?? idea.author.username ?? "Anonymous User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{idea.author.username ?? "anonymous"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs bg-gradient-to-r text-white", getCategoryColor(idea.category))}>
                {idea.category.replace('_', ' ')}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(idea.createdAt)}
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <Link href={`/ideas/${idea.id}`} className="block group">
            <motion.h3
              className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors"
              animate={{
                color: isHovered ? "rgb(139, 92, 246)" : "hsl(var(--foreground))"
              }}
              transition={{ duration: 0.3 }}
            >
              {idea.title}
            </motion.h3>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
              {idea.description.length > 200 
                ? `${idea.description.substring(0, 200)}...` 
                : idea.description
              }
            </p>
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <AnimatePresence>
              {idea.tags.slice(0, 4).map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {idea.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{idea.tags.length - 4} more
                </Badge>
              )}
            </AnimatePresence>
          </div>

          {/* Skills Needed */}
          {idea.wantsTeam && idea.neededSkills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-foreground mb-2">Skills needed:</p>
              <div className="flex flex-wrap gap-1">
                {idea.neededSkills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {idea.neededSkills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{idea.neededSkills.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center space-x-4">
              {/* Voting */}
              <div className="flex items-center gap-1">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote("UP")}
                    disabled={!currentUserId}
                    className={cn(
                      "p-1 h-8 w-8",
                      userVote === "UP" 
                        ? "text-green-600 bg-green-50" 
                        : "text-muted-foreground hover:text-green-600"
                    )}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </motion.div>
                
                <span className="text-sm font-medium text-foreground min-w-[2rem] text-center">
                  {idea.upvotes - idea.downvotes}
                </span>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote("DOWN")}
                    disabled={!currentUserId}
                    className={cn(
                      "p-1 h-8 w-8",
                      userVote === "DOWN" 
                        ? "text-red-600 bg-red-50" 
                        : "text-muted-foreground hover:text-red-600"
                    )}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              {/* Comments */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link href={`/ideas/${idea.id}#comments`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">{idea._count.comments}</span>
                  </Button>
                </Link>
              </motion.div>

              {/* Interests for team building */}
              {idea.wantsTeam && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{idea._count.interests} interested</span>
                </div>
              )}
            </div>

            {/* Interest Button */}
            {idea.wantsTeam && currentUserId && idea.author.id !== currentUserId && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleInterest}
                  size="sm"
                  className={cn(
                    "transition-all duration-300",
                    isInterested
                      ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                      : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                  )}
                >
                  <motion.div
                    animate={{
                      scale: isInterested ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className={cn("h-4 w-4 mr-1", isInterested && "fill-current")} />
                  </motion.div>
                  {isInterested ? "Interested" : "Join Team"}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Floating particles effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/60 rounded-full"
                  initial={{
                    x: Math.random() * 100 + "%",
                    y: Math.random() * 100 + "%",
                    scale: 0,
                  }}
                  animate={{
                    y: [null, "-20px"],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

ModernIdeaCard.displayName = "ModernIdeaCard"

export { ModernIdeaCard }
