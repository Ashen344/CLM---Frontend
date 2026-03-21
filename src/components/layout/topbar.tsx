import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TopbarProps = {
  title: string;
};

export default function Topbar({ title }: TopbarProps) {
  return (
    <div className="flex items-start justify-between px-6 py-5">
      <h2 className="text-[22px] font-medium text-[#5f5f66]">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-[12px] font-medium text-[#2b2b38]">Anima Agrawal</p>
          <p className="text-[11px] text-[#8a8a96]">U.P, India</p>
        </div>

        <Avatar className="h-8 w-8">
          <AvatarImage src="https://i.pravatar.cc/100?img=47" />
          <AvatarFallback>AA</AvatarFallback>
        </Avatar>

        <ChevronDown size={16} className="text-[#7b7b86]" />
      </div>
    </div>
  );
}