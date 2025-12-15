import { PlusIcon } from '@heroicons/react/24/outline';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

const FloatingActionButton = ({ 
  onClick, 
  icon = <PlusIcon className="h-6 w-6" />, 
  label,
  className = "" 
}: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        bg-blue-600 hover:bg-blue-700
        text-white rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-200
        transform hover:scale-105
        focus:outline-none focus:ring-4 focus:ring-blue-300
        flex items-center justify-center
        min-w-[56px] min-h-[56px]
        ${className}
      `}
      aria-label={label || "Create new"}
      title={label || "Create new"}
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
