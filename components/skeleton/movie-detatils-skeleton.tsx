import { Header } from "@/components/header";

export default function MovieDetailsSkeleton() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-gray-200 dark:bg-[#111317]">
      <Header />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 h-4 w-32 bg-gray-300 dark:bg-[#1a1d23] rounded animate-pulse"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Poster + buttons */}
          <div className="lg:col-span-3">
            <div className="sticky top-28">
              <div className="aspect-[2/3] w-full rounded-lg bg-gray-300 dark:bg-[#1a1d23] animate-pulse"></div>
              <div className="mt-4 flex flex-col gap-3">
                <div className="h-10 w-full rounded-md bg-gray-300 dark:bg-[#1a1d23] animate-pulse"></div>
                <div className="h-10 w-full rounded-md bg-gray-300 dark:bg-[#1a1d23] animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Info + Reviews */}
          <div className="lg:col-span-9 flex flex-col gap-10">
            {/* Movie Info */}
            <section className="flex flex-col gap-2">
              <div className="h-4 w-40 bg-gray-300 dark:bg-[#1a1d23] rounded animate-pulse"></div>
              <div className="h-8 w-72 bg-gray-300 dark:bg-[#1a1d23] rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-300 dark:bg-[#1a1d23] rounded animate-pulse"></div>
              <div className="h-20 w-full max-w-2xl bg-gray-300 dark:bg-[#1a1d23] rounded animate-pulse mt-2"></div>
            </section>

            {/* Rating Distribution */}
            <section className="p-6 bg-gray-300 dark:bg-[#1a1d23] rounded-lg border border-border dark:border-[#292d38]">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex flex-col items-center gap-2 pb-6 md:pb-0 md:pr-6 text-center border-b md:border-b-0 md:border-r border-border dark:border-[#292d38]">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-[#292d38] rounded animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-[#292d38] rounded animate-pulse"></div>
                </div>
                <div className="flex-1 grid gap-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-[#292d38] rounded animate-pulse"></div>
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-[#292d38] rounded animate-pulse"></div>
                      <div className="h-4 w-8 bg-gray-200 dark:bg-[#292d38] rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="h-6 w-32 bg-gray-300 dark:bg-[#1a1d23] rounded animate-pulse mb-4"></div>
              <div className="flex flex-col gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 border-b border-border dark:border-[#292d38] pb-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gray-200 dark:bg-[#292d38] animate-pulse"></div>
                      <div className="flex flex-col gap-2">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-[#292d38] rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-[#292d38] rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className="h-5 w-5 rounded bg-gray-200 dark:bg-[#292d38] animate-pulse"
                        ></div>
                      ))}
                    </div>
                    <div className="h-12 w-full bg-gray-200 dark:bg-[#292d38] rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
