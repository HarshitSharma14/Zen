import React from 'react'
import { motion } from 'framer-motion'

const PageLoader = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.p
                    className="text-white text-xl font-medium"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Loading...
                </motion.p>
            </motion.div>
        </div>
    )
}

export default PageLoader