"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function DynamicPageHeader({pageTitle}: {pageTitle?: string}) {
  const pathname = usePathname()

  // Split route into parts
  const segments = pathname.split("/").filter(Boolean)

  // Convert: web-design -> Web Design
  const formatText = (text: string) =>
    text
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())

  

  return (
    <div className="space-y-1">
      {/* Dynamic H1 */}
      <h1 className="text-2xl font-bold text-slate-900">
        {pageTitle}
      </h1>

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-slate-400">
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Dynamic Segments */}
          {segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/")
            const isLast = index === segments.length - 1

            return (
              <div key={index} className="flex items-center gap-2">
                <BreadcrumbSeparator className="text-slate-400" />

                <BreadcrumbItem>
                  {isLast ? (
                    <span className="text-slate-400">
                      {formatText(segment)}
                    </span>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href} className="text-slate-400">
                        {formatText(segment)}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
