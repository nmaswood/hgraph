import useSWR from "swr";

export const useFetchFacets = () => {
  const { data, isLoading, mutate } = useSWR<{
    companyIds: string[];
    personIds: string[];
  }>("/api/proxy/data/facets", async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data.data;
  });

  return {
    data: data ?? {
      companyIds: [],
      personIds: [],
    },
    isLoading,
    mutate,
  };
};
