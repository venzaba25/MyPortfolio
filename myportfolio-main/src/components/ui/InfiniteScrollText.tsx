import { motion } from "framer-motion";

interface InfiniteScrollTextProps {
  features: string[];
}

export function InfiniteScrollText({ features }: InfiniteScrollTextProps) {
  // Duplicate the features array to create seamless loop
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Scrolling container */}
      <motion.div
        className="flex gap-4 py-3"
        animate={{
          x: [0, -50 * features.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: features.length * 3,
            ease: "linear",
          },
        }}
      >
        {duplicatedFeatures.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <span className="text-sm text-zinc-300">{feature}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
