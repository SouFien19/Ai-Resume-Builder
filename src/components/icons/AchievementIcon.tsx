// An achievement or trophy icon
const AchievementIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 8V2" />
      <path d="M12 8H8" />
      <path d="M12 8H16" />
      <path d="M12 14V22" />
      <path d="M12 14H8" />
      <path d="M12 14H16" />
      <path d="M8 2L16 2" />
      <path d="M8 22L16 22" />
      <path d="M2 8L2 16" />
      <path d="M22 8L22 16" />
    </svg>
  );
  
  export default AchievementIcon;
  