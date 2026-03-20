import type { ReactNode } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

type AppLayoutProps = {
  title: string;
  children: ReactNode;
};

export default function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <div className="app-frame">
      <div className="app-shell flex">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />
          <main className="flex-1 px-6 pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}