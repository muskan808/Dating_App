import XLSX from "xlsx";

export const exportXLSX = (exportData: any[]) => {
  const wb = XLSX.utils.book_new();
  let temp: any = JSON.stringify(exportData);
  temp = JSON.parse(temp);
  const ws = XLSX.utils.json_to_sheet(temp);
  XLSX.utils.book_append_sheet(wb, ws, "export");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer;
};
