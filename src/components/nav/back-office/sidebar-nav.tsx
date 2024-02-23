"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { adminSidebarNavItems } from "@/data/nav-items"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CustomTooltip } from "@/components/custom-tooltip"
import { Icons } from "@/components/icons"

interface SidebarNavProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function SidebarNav({
  collapsed,
  setCollapsed,
}: SidebarNavProps): JSX.Element {
  const pathname = usePathname()

  const [openCollapsible, setOpenCollapsible] = React.useState<string | null>(
    null
  )

  const handleCollapsibleToggle = (href: string): void => {
    setOpenCollapsible((prev) => (prev === href ? null : href))
  }

  React.useEffect((): void => {
    const collapsibleItem = adminSidebarNavItems.find(
      (item) =>
        item.subItems &&
        item.subItems.some((subitem) => subitem.href === pathname)
    )

    if (collapsibleItem) {
      setOpenCollapsible(collapsibleItem.href)
    } else {
      setOpenCollapsible(null)
    }

    return
  }, [pathname])

  return (
    <nav className="space-y-2 px-2 py-5">
      {adminSidebarNavItems.map((item) => {
        const Icon = Icons[item.icon as keyof typeof Icons]

        const isCollapsibleOpen = openCollapsible === item.href

        return (
          <div key={item.href}>
            {item.subItems &&
            item.subItems.length > 0 &&
            item.title !== "Start" ? (
              <Collapsible
                open={isCollapsibleOpen}
                onOpenChange={() => handleCollapsibleToggle(item.href)}
              >
                <CustomTooltip text={item.title}>
                  <CollapsibleTrigger
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "flex w-full items-center text-base",
                      collapsed ? "justify-center" : "justify-between"
                    )}
                    onClick={() => setCollapsed(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span
                        className={cn(
                          "text-sm text-muted-foreground",
                          collapsed && "hidden"
                        )}
                      >
                        {item.title}
                      </span>
                    </div>

                    {isCollapsibleOpen ? (
                      <Icons.chevronUp
                        className={cn(
                          "size-4 text-muted-foreground",
                          collapsed && "hidden"
                        )}
                      />
                    ) : (
                      <Icons.chevronDown
                        className={cn(
                          "size-4 text-muted-foreground",
                          collapsed && "hidden"
                        )}
                      />
                    )}
                  </CollapsibleTrigger>
                </CustomTooltip>

                <CollapsibleContent className="w-full space-y-1 py-1 pl-6">
                  {item.subItems.map((subitem) => (
                    <Button
                      variant={
                        pathname === subitem.href ? "secondary" : "ghost"
                      }
                      key={subitem.href}
                      className={cn(
                        "group flex w-full items-center justify-between gap-2 text-base",
                        pathname === subitem.href
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <Link
                        href={subitem.href}
                        className="flex flex-1 items-start text-sm"
                      >
                        {subitem.title}
                      </Link>

                      {subitem.hrefPlus && (
                        <Link
                          href={subitem.hrefPlus}
                          className="hidden text-muted-foreground hover:text-foreground group-hover:flex"
                        >
                          <Icons.plusCircle className="size-4" />
                        </Link>
                      )}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <CustomTooltip text={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    (pathname.startsWith("/admin/start") &&
                      item.href.startsWith("/admin/start")) ||
                      pathname === item.href
                      ? buttonVariants({ variant: "secondary" })
                      : buttonVariants({ variant: "ghost" }),
                    "group flex w-full justify-start gap-2 text-base"
                  )}
                >
                  <Icon className="size-4" />
                  <span
                    className={cn(
                      (pathname.startsWith("/admin/start") &&
                        item.href.startsWith("/admin/start")) ||
                        pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground",
                      "text-sm group-hover:text-foreground",
                      collapsed && "hidden"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              </CustomTooltip>
            )}
          </div>
        )
      })}
    </nav>
  )
}
