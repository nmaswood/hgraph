import useSWRMutation from "swr/mutation";

export const useWriteCompany = () => {
  const data = useSWRMutation<
    void,
    unknown,
    "/api/proxy/data/company",
    {
      companyId: number;
      companyName: string;
      headcount: number | undefined;
    }
  >("/api/proxy/data/company", async (url: string, args) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args.arg),
    });
    const data = await res.json();
    return data;
  });

  return data;
};
