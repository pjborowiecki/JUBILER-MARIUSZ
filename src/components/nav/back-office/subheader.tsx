import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { CustomTooltip } from "@/components/custom-tooltip"
import { Icons } from "@/components/icons"

interface SubheaderProps {
  buttonText: string
  buttonLink: string
}

export function Subheader({
  buttonText,
  buttonLink,
}: SubheaderProps): JSX.Element {
  return (
    <div className="flex h-16 w-full items-center justify-end border-b bg-tertiary px-5">
      <div className="flex items-center gap-2">
        <CustomTooltip text="Add New Category">
          <Link
            href={buttonLink}
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
            aria-label={buttonText}
          >
            <Icons.plus aria-hidden="true" className="size-3" />
            <span>{buttonText}</span>
          </Link>
        </CustomTooltip>
      </div>
    </div>
  )
}
