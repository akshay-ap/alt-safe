export const COPY_FAILED = "Could not copy to the clipboard";

/** Resolves false instead of throwing when the clipboard is missing (non-secure origin) or the browser refuses the write. */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
