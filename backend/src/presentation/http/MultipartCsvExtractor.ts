import { Request } from "express";

export class MultipartCsvExtractor {
  extract(request: Request): string {
    const body = Buffer.isBuffer(request.body)
      ? request.body
      : Buffer.from(typeof request.body === "string" ? request.body : "");
    const contentType = request.headers["content-type"] ?? "";

    if (contentType.includes("multipart/form-data")) {
      return this.extractMultipart(body, contentType);
    }

    return body.toString("utf8");
  }

  private extractMultipart(body: Buffer, contentType: string): string {
    const boundaryMatch = contentType.match(/boundary=([^;]+)/i);

    if (!boundaryMatch) {
      throw new Error("Multipart upload is missing a boundary.");
    }

    const boundary = `--${boundaryMatch[1].replace(/^"|"$/g, "")}`;
    const parts = body.toString("utf8").split(boundary);
    const filePart = parts.find((part) => part.includes("Content-Disposition") && part.includes("filename="))
      ?? parts.find((part) => part.includes("Content-Disposition"));

    if (!filePart) {
      throw new Error("CSV upload did not include a file field.");
    }

    const separator = filePart.includes("\r\n\r\n") ? "\r\n\r\n" : "\n\n";
    const bodyStart = filePart.indexOf(separator);

    if (bodyStart === -1) {
      throw new Error("CSV upload was not readable.");
    }

    return filePart
      .slice(bodyStart + separator.length)
      .replace(/\r?\n--$/, "")
      .trim();
  }
}
