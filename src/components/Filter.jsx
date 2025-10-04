import { useSearchParams } from "react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

export function Filter({ filterFileds, options, defaultValue }) {
  const [searchParams, setSearchParams] = useSearchParams();

  function handleClick(value) {
    searchParams.set(filterFileds, value);

    setSearchParams(searchParams);
  }

  return (
    <Tabs defaultValue={defaultValue} onValueChange={handleClick}>
      <TabsList className="border-grey-100 bg-grey-0 flex gap-1 rounded-sm border p-1 shadow-sm">
        {options.map((opt) => (
          <TabsTrigger
            key={opt.value}
            value={opt.value}
            className="data-[state=active]:bg-brand-600 data-[state=active]:text-brand-50 hover:enabled:bg-brand-600 hover:enabled:text-brand-50 rounded-sm px-2 py-[0.44rem] text-[1.4rem] font-medium transition-all duration-300"
          >
            {opt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
