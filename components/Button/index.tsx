type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "play" | "game";
  size?: "sm" | "md" | "lg";
  className?: string;
  isSelected?: boolean;
  children: React.ReactNode;
};

export default function Button({
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  isSelected = false,
  children,
}: ButtonProps) {
  const baseStyles =
    "relative flex items-center justify-center font-medium transition-all duration-200 ease-in-out";

  const variants = {
    primary: `border-[1.7px] border-white rounded-lg 
        ${
          isSelected
            ? "bg-gradient-to-b from-[#02e405] to-[#176d1b] text-shadow"
            : "bg-black/50 text-[#00ff00]"
        } 
        hover:opacity-90 text-white disabled:opacity-50 disabled:hover:opacity-50`,
    play: `border-[3px] border-[#ffb100] rounded-lg text-shadow-play
        ${
          isSelected
            ? "bg-black/50 text-[#00ff00]"
            : "bg-gradient-to-b from-[#ffe500] to-[#ff8a00]"
        } 
        hover:opacity-90 text-white disabled:opacity-50 disabled:hover:opacity-50`,
    game: "bg-emerald-900/50 hover:bg-emerald-900/70 text-white font-bold",
  };
  //
  const sizes = {
    sm: " text-sm ",
    md: "h-14 px-6 py-1 text-3xl",
    lg: "h-16 px-8 py-1 text-5xl",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
