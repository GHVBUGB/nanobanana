export async function pickSingleFile(accept = 'image/*'): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const file = input.files && input.files[0] ? input.files[0] : null
      resolve(file)
    }
    input.click()
  })
}

export function toObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

export async function compressImageStub(file: File): Promise<File> {
  // TODO: integrate real compression; return original for now
  return file
}





