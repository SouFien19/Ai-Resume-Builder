declare module "pdf-parse" {
  interface PDFInfo {
    version?: string;
    [key: string]: unknown;
  }
  interface PDFMetadata { [key: string]: unknown }
  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata?: PDFMetadata;
    text: string;
    version: string;
  }
  function pdf(buffer: Buffer | Uint8Array): Promise<PDFData>;
  export default pdf;
}

declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFInfo {
    version?: string;
    [key: string]: unknown;
  }
  interface PDFMetadata { [key: string]: unknown }
  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata?: PDFMetadata;
    text: string;
    version: string;
  }
  function pdf(buffer: Buffer | Uint8Array): Promise<PDFData>;
  export default pdf;
}
