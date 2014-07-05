
 interface LZStringStatic{
    compressToUTF16(s: string): string;
    decompressFromUTF16(s: string): string;
    compressToBase64(s: string): string;
    decompressFromBase64(s: string): string;
}

 declare var LZString: LZStringStatic;
