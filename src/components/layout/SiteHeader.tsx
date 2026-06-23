import { AccountMenu } from "./AccountMenu";
import { StickyHeader } from "./StickyHeader";

export function SiteHeader() {
  return <StickyHeader>
    <div className="mx-auto max-w-6xl px-6 pt-8 pb-3">
      <div className="flex items-start justify-between gap-6">
        <StickyHeader.Logo />
        <div className="flex flex-col items-end gap-3">
          <StickyHeader.Nav />
          <AccountMenu />
        </div>
      </div>
      <div className="mt-4 transition-opacity duration-300" data-weave-divider>
        <StickyHeader.WeaveDivider />
      </div>
    </div>
  </StickyHeader>;
}
