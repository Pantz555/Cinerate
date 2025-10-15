export interface UserRatingData {
  movieTitle: string;
  genre: string;
  ratings: {
    acting: number;
    plot: number;
    cinematography: number;
    direction: number;
    entertainment: number;
    overall: number;
  };
  review?: string;
  ratedAt: string;
}

export function exportToCSV(data: UserRatingData[]): string {
  const headers = [
    "Movie Title",
    "Genre",
    "Acting",
    "Plot",
    "Cinematography",
    "Direction",
    "Entertainment",
    "Overall Rating",
    "Review",
    "Rated At",
  ];

  const rows = data.map((item) => [
    `"${item.movieTitle}"`,
    `"${item.genre}"`,
    item.ratings.acting,
    item.ratings.plot,
    item.ratings.cinematography,
    item.ratings.direction,
    item.ratings.entertainment,
    item.ratings.overall.toFixed(1),
    `"${item.review || ""}"`,
    item.ratedAt,
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n",
  );

  return csv;
}

export function exportToJSON(data: UserRatingData[]): string {
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      totalRatings: data.length,
      ratings: data,
    },
    null,
    2,
  );
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
