import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserAvatar({
  email,
  className,
  fallbackClassName,
}: {
  email: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const letter = email?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <Avatar className={className}>
      <AvatarFallback className={fallbackClassName}>{letter}</AvatarFallback>
    </Avatar>
  );
}
