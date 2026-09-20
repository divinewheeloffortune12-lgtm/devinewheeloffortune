import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import "./FoldText.css";

interface FoldTextProps {
  text: string;
  splitBy?: "char" | "word" | "line";
  hinge?: "top" | "bottom" | "left" | "right";
  trigger?: "mount" | "hover" | "inView";
  duration?: number;
  stagger?: number;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  className?: string;
}

const FoldText: React.FC<FoldTextProps> = ({
  text,
  splitBy = "char",
  hinge = "top",
  trigger = "mount",
  duration = 0.65,
  stagger = 0.045,
  color,
  fontSize,
  fontWeight,
  className = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [shouldAnimate, setShouldAnimate] = useState(trigger === "mount");

  useEffect(() => {
    if (trigger === "inView" && isInView) {
      setShouldAnimate(true);
    }
  }, [trigger, isInView]);

  const words = text.split(" ");
  const chars = text.split("");

  let segments: string[] = [];
  if (splitBy === "char") segments = chars;
  else if (splitBy === "word") segments = words;
  else segments = [text];

  const getRotation = () => {
    switch (hinge) {
      case "top": return { rotateX: -90 };
      case "bottom": return { rotateX: 90 };
      case "left": return { rotateY: -90 };
      case "right": return { rotateY: 90 };
      default: return { rotateX: -90 };
    }
  };

  const hiddenState = {
    opacity: 0,
    ...getRotation(),
  };

  const visibleState = {
    opacity: 1,
    rotateX: 0,
    rotateY: 0,
  };

  return (
    <span
      ref={ref}
      className={`fold-text ${className}`}
      style={{
        "--fold-text-color": color,
        "--fold-text-font-size": fontSize,
        "--fold-text-font-weight": fontWeight,
      } as React.CSSProperties}
      onMouseEnter={() => trigger === "hover" && setShouldAnimate(true)}
      onMouseLeave={() => trigger === "hover" && setShouldAnimate(false)}
    >
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {segments.map((segment, index) => (
          <React.Fragment key={index}>
            <span
              className="fold-text-segment"
              data-fold-split={splitBy}
            >
              <motion.span
                className="fold-text-piece"
                data-fold-hinge={hinge}
                initial={hiddenState}
                animate={shouldAnimate ? visibleState : hiddenState}
                transition={{
                  duration,
                  delay: shouldAnimate ? index * stagger : 0,
                  ease: [0.16, 1, 0.3, 1], // Custom ease similar to out-expo
                }}
              >
                {segment}
              </motion.span>
            </span>
            {splitBy === "word" && index < segments.length - 1 && (
              <span className="fold-text-whitespace"> </span>
            )}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
};

export default FoldText;
