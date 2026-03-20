import { Menu, Search } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import AiAnalysisCard from "@/components/dashboard/ai-analysis-card";

export default function EditorPage() {
  return (
    <AppLayout title="Contract editing screen">
      <div className="mb-5 flex h-11 w-[300px] items-center gap-3 rounded-full bg-[#f0eaf7] px-4">
        <Menu size={16} className="text-[#6d6d79]" />
        <input
          placeholder="Search for Keywords"
          className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#8d8d9b]"
        />
        <Search size={15} className="text-[#6d6d79]" />
      </div>

      <div className="grid grid-cols-[1.2fr_0.7fr] gap-8">
        <div className="doc-sheet min-h-[700px] p-10">
          <div className="mx-auto max-w-[520px] text-[10px] leading-5 text-[#1e1e1f]">
            <h2 className="mb-5 text-center text-[14px] font-bold">Design Services Agreement</h2>

            <p className="mb-3">
              This Design Services Agreement is entered into and executed on 12th May 2022
              by and between Urban Nerds Ltd. and Designer named "Contractor".
            </p>

            <h3 className="mt-5 font-bold">1. Purpose</h3>
            <p className="mt-2">
              The purpose of this Agreement is to outline the terms and conditions for the
              branding and web design services to be provided by Contractor to Client.
            </p>

            <h3 className="mt-5 font-bold">2. Scope of work</h3>
            <p className="mt-2">
              Contractor will provide the following services to Client: branding services,
              logo design, brand guidelines, and any other branding materials as agreed upon
              by both parties. Web design services, including the design and development of a
              new website for the Client.
            </p>

            <h3 className="mt-5 font-bold">3. Deliverables</h3>
            <p className="mt-2">
              Contractor will deliver the following to Client: a completed logo, favicon,
              wireframes, visual concepts, and final design files and code.
            </p>

            <h3 className="mt-5 font-bold">4. Payment and Ongoing costs</h3>
            <p className="mt-2">
              The Client will pay the Contractor the total agreed sum, as detailed in the
              project package, for the services rendered. Additional taxes, customisation,
              maintenance, or third-party platform fees may apply.
            </p>

            <h3 className="mt-5 font-bold">5. Terms</h3>
            <p className="mt-2">
              Both parties agree to the terms, timelines, and review process stated in this
              agreement.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <AiAnalysisCard />
        </div>
      </div>
    </AppLayout>
  );
}