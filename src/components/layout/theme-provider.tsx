"use client";

import React, { createContext, useContext, useEffect } from "react"

type Theme = "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
}

const initialState: ThemeProviderState = {
  theme: "light",
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark")
    root.classList.add("light")
  }, [])

  return (
    <ThemeContext.Provider {...props} value={{ theme: "light" }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
