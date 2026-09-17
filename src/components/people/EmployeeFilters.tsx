"use client";

import { Button, Input, SearchableSelect } from "@/components/ui";
import {
  DEPARTMENTS,
  EMPLOYEE_STATUS_TABS,
  EmployeeStatusTab,
} from "@/constants";
import { RotateCcw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export interface EmployeeFiltersProps {
  search?: string;
  selectedTab?: EmployeeStatusTab;
  department?: string;
  role?: string;
  location?: string;
  uniqueRoles?: string[];
  uniqueLocations?: string[];
  className?: string;
}

export function EmployeeFilters({
  search = "",
  selectedTab = "Active",
  department = "All",
  role = "All",
  location = "All",
  uniqueRoles = [],
  uniqueLocations = [],
  className = "",
}: EmployeeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams((params) => {
      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }
    });
  };

  const handleSelectChange = (
    key: "department" | "role" | "location",
    value: string,
  ) => {
    pushParams((params) => {
      if (value && value !== "All") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
  };

  const handleTabChange = (tab: EmployeeStatusTab) => {
    pushParams((params) => {
      if (tab !== "Active") {
        params.set("tab", tab);
      } else {
        params.delete("tab");
      }
    });
  };

  const handleReset = () => {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    search.trim() !== "" ||
      (selectedTab !== "Active" && selectedTab !== "All") ||
      department !== "All" ||
      role !== "All" ||
      location !== "All",
  );

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={`relative z-20 p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 ${isPending ? "opacity-80" : ""} ${className}`}
    >
      <div className="w-full sm:flex-1 sm:max-w-md flex items-center gap-2">
        <Input
          name="search"
          shape="pill"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by name, email..."
          leftIcon={<Search className="w-4 h-4 text-stone-400" />}
          containerClassName="w-full"
        />
        <Button type="submit" variant="primary" size="md" shape="pill">
          Search
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <SearchableSelect
          name="department"
          options={[...DEPARTMENTS]}
          value={department}
          placeholder="All Depts"
          onChange={(val) => handleSelectChange("department", val)}
        />

        <SearchableSelect
          name="role"
          options={uniqueRoles}
          value={role}
          placeholder="All Roles"
          onChange={(val) => handleSelectChange("role", val)}
        />

        <SearchableSelect
          name="location"
          options={uniqueLocations}
          value={location}
          placeholder="All Locations"
          onChange={(val) => handleSelectChange("location", val)}
        />

        <div className="overflow-x-auto">
          <div className="inline-flex p-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 whitespace-nowrap">
            {EMPLOYEE_STATUS_TABS.map((tab) => {
              const isSelected = selectedTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-amber-500 text-stone-950 shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900/30 dark:hover:text-amber-100"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            shape="pill"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Reset
          </Button>
        )}
      </div>
    </form>
  );
}
