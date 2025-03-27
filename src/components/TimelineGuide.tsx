import React, { useEffect, useRef } from 'react';
import { FileText, Wand2, Download, ArrowRight, FileUp, Brain } from 'lucide-react';

interface TimelineItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  index: number;
  theme: 'light' | 'dark';
  position: 'left' | 'right';
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  icon: Icon,
  title,
  description,
  gradient,
  index,
  theme,
  position
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-in');
          entry.target.style.opacity = '1';
        }
      },
      {
        threshold: 0.2,
        rootMargin: '-50px'
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={itemRef} 
      className={`
        timeline-item opacity-0 flex items-center gap-8
        ${position === 'right' ? 'flex-row-reverse' : 'flex-row'}
      `}
    >
      <div className={`
        timeline-content relative w-[calc(50%-2rem)] p-6 rounded-xl
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
        transform transition-all duration-500 hover:scale-105 hover:shadow-xl
        group cursor-pointer
      `}>
        <div className={`
          absolute top-1/2 ${position === 'left' ? '-right-4' : '-left-4'}
          w-4 h-4 rotate-45 transform
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
        `} />
        
        <div className={`
          w-16 h-16 mb-4 rounded-xl
          bg-gradient-to-br ${gradient}
          flex items-center justify-center
          transform transition-all duration-300
          group-hover:scale-110 group-hover:rotate-3
        `}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        <h3 className={`
          text-xl font-semibold mb-2
          ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
        `}>
          {index}. {title}
        </h3>

        <p className={`
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
          group-hover:text-opacity-90
        `}>
          {description}
        </p>

        <div className={`
          mt-4 flex items-center gap-2
          text-sm font-medium
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        `}>
          <span>Learn more</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

interface TimelineGuideProps {
  theme: 'light' | 'dark';
}

export function TimelineGuide({ theme }: TimelineGuideProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const line = entry.target.querySelector('.timeline-line');
          if (line) {
            line.classList.add('animate-draw-line');
          }
        }
      },
      {
        threshold: 0.2
      }
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: FileUp,
      title: 'Upload Your Content',
      description: 'Start by pasting your study material or uploading a PDF/image file. We support various formats for your convenience.',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: 'Choose Learning Method',
      description: 'Select your preferred learning tool: summarize for quick review, flashcards for active recall, or quizzes for self-assessment.',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Wand2,
      title: 'Customize Settings',
      description: 'Tailor the output to your needs by adjusting length, difficulty, and other parameters for optimal learning.',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: FileText,
      title: 'Generate & Review',
      description: 'Get instant, AI-powered study materials generated from your content, ready for immediate use.',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Download,
      title: 'Save & Share',
      description: 'Download your materials in markdown format or share them directly with study partners.',
      gradient: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <div ref={timelineRef} className="timeline-container relative py-16 px-4">
      <div className="timeline-line absolute left-1/2 top-0 w-1 h-full -translate-x-1/2 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500" />
      
      {steps.map((step, index) => (
        <TimelineItem
          key={index}
          {...step}
          index={index + 1}
          theme={theme}
          position={index % 2 === 0 ? 'left' : 'right'}
        />
      ))}
    </div>
  );
}