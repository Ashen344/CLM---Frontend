import { Image as ImageIcon } from "lucide-react";

export default function TemplateCard() {
  return (
    <div className="w-[170px]">
      <div className="border-[6px] border-[#d3d3d6] bg-[#ececef] p-8">
        <div className="template-thumb flex h-[90px] items-center justify-center">
          <ImageIcon className="text-[#9b9cb0]" size={28} strokeWidth={1.8} />
        </div>
      </div>
      <div className="bg-[#d3d3d6] py-2 text-center text-[12px] font-medium text-[#2a2a35]">
        Template
      </div>
    </div>
  );
}