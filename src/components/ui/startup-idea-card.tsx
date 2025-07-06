import * as React from "react"
import { motion } from "framer-motion"
import { Lightbulb, TrendingUp, Users, Zap, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface StartupIdeaCardProps {
  title?: string
  description?: string
  category?: string
  difficulty?: "Easy" | "Medium" | "Hard"
  marketSize?: string
  icon?: React.ReactNode
  tags?: string[]
  className?: string
}

const difficultyColors = {
  Easy: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  Hard: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
}

const categoryIcons = {
  "Tech": <Zap className="w-4 h-4" />,
  "Business": <TrendingUp className="w-4 h-4" />,
  "Social": <Users className="w-4 h-4" />,
  "Innovation": <Lightbulb className="w-4 h-4" />
}

function StartupIdeaCard({
  title = "AI-Powered Personal Finance Assistant",
  description = "A smart mobile app that analyzes spending patterns, provides personalized budgeting advice, and automates savings goals using machine learning algorithms.",
  category = "Tech",
  difficulty = "Medium",
  marketSize = "$2.5B",
  icon,
  tags = ["AI", "FinTech", "Mobile", "SaaS"],
  className
}: StartupIdeaCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative w-full max-w-md",
        "bg-background border border-border rounded-lg overflow-hidden",
        "shadow-sm hover:shadow-lg transition-all duration-300",
        "hover:border-primary/20",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full bg-repeat bg-[length:20px_20px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill='currentColor'%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon || categoryIcons[category as keyof typeof categoryIcons] || <Lightbulb className="w-5 h-5 text-primary" />}
            <span className="text-sm font-medium text-muted-foreground">{category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              difficultyColors[difficulty]
            )}>
              {difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Market:</span>
            <span className="text-sm font-semibold text-foreground">{marketSize}</span>
          </div>
          
          <motion.button
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            whileHover={{ x: 4 }}
          >
            Explore
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  )
}

export default StartupIdeaCard
