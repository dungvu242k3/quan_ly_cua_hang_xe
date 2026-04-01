import { Check, ChevronDown, Search, X } from "lucide-react"
import * as React from "react"

import { cn } from "../../lib/utils"

interface Option {
  value: string
  label: string
  price?: string
}

interface MultiSearchableSelectProps {
  options: Option[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

const MAX_VISIBLE_ITEMS = 50;

export const MultiSearchableSelect = React.memo(function MultiSearchableSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  emptyMessage = "Không có kết quả.",
  className,
  disabled = false,
}: MultiSearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter + limit items for performance
  const filteredOptions = React.useMemo(() => {
    if (!search) return options.slice(0, MAX_VISIBLE_ITEMS);
    const q = search.toLowerCase();
    const matched = options.filter(o => o.label.toLowerCase().includes(q));
    return matched.slice(0, MAX_VISIBLE_ITEMS);
  }, [options, search]);

  const remainingCount = React.useMemo(() => {
    if (!search) return Math.max(0, options.length - MAX_VISIBLE_ITEMS);
    const q = search.toLowerCase();
    const totalMatched = options.filter(o => o.label.toLowerCase().includes(q)).length;
    return Math.max(0, totalMatched - MAX_VISIBLE_ITEMS);
  }, [options, search]);

  // Memoize selected labels for the trigger display
  const selectedLabels = React.useMemo(() => {
    return value.map(val => {
      const opt = options.find(o => o.value === val);
      return { value: val, label: opt?.label || val };
    });
  }, [value, options]);

  React.useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleToggle = React.useCallback((optionValue: string) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      onValueChange(value.filter(v => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  }, [value, onValueChange]);

  return (
    <div className="relative">
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center justify-between gap-1 px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus-within:ring-2 focus-within:ring-primary/20 text-[14px] font-bold transition-all cursor-pointer",
          open && "ring-2 ring-primary/20 border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((item) => (
              <div
                key={item.value}
                className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[12px] font-bold text-primary group transition-colors hover:bg-primary/20"
                onClick={(e) => {
                  e.stopPropagation()
                  onValueChange(value.filter(v => v !== item.value))
                }}
              >
                {item.label}
                <X size={12} className="text-primary/40 group-hover:text-primary" />
              </div>
            ))
          ) : (
            <span className="text-muted-foreground/60 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground/40 transition-transform duration-200 shrink-0",
            open && "rotate-180"
          )}
        />
      </div>

      {open && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0" style={{ zIndex: 1099 }} onClick={() => setOpen(false)} />

          <div 
            className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
            style={{ zIndex: 1100 }}
          >
            {/* Search input */}
            <div className="flex items-center border-b border-border/40 px-3 bg-muted/5">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-40" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex h-10 w-full bg-transparent py-3 text-[13px] outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-[12px] text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <>
                  {filteredOptions.map((option) => {
                    const isSelected = value.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(option.value);
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-[13px] font-bold transition-colors text-popover-foreground",
                          isSelected ? "bg-primary text-white" : "hover:bg-primary/10"
                        )}
                      >
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.price && (
                            <span className={cn(
                              "text-[11px] font-medium",
                              isSelected ? "text-white/80" : "text-emerald-600"
                            )}>
                              {option.price}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    );
                  })}
                  {remainingCount > 0 && (
                    <div className="py-2 px-3 text-center text-[11px] text-muted-foreground italic border-t border-border/30 mt-1">
                      Còn {remainingCount} kết quả khác. Gõ thêm để thu hẹp...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
})
