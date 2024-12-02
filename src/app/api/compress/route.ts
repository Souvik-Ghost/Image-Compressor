import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const quality = Number(formData.get('quality')) || 80;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Determine the input format
    const metadata = await sharp(buffer).metadata();
    const format = metadata.format;

    if (!format) {
      return NextResponse.json(
        { error: 'Unsupported image format' },
        { status: 400 }
      );
    }

    let compressedImageBuffer;
    try {
      switch (format.toLowerCase()) {
        case 'png':
          compressedImageBuffer = await sharp(buffer)
            .png({ quality, compressionLevel: 9 })
            .toBuffer();
          break;
        case 'webp':
          compressedImageBuffer = await sharp(buffer)
            .webp({ quality, effort: 6 })
            .toBuffer();
          break;
        case 'jpeg':
        case 'jpg':
          compressedImageBuffer = await sharp(buffer)
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();
          break;
        case 'avif':
          compressedImageBuffer = await sharp(buffer)
            .avif({ quality })
            .toBuffer();
          break;
        default:
          // Convert unknown formats to JPEG
          compressedImageBuffer = await sharp(buffer)
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();
      }
    } catch (error) {
      console.error('Error during compression:', error);
      return NextResponse.json(
        { error: 'Failed to compress image' },
        { status: 500 }
      );
    }

    // If the compressed size is larger than the original, return the original
    if (compressedImageBuffer.length >= buffer.length) {
      return NextResponse.json({
        success: true,
        data: `data:image/${format};base64,${buffer.toString('base64')}`,
        originalSize: buffer.length,
        compressedSize: buffer.length,
        message: 'Image already optimized'
      });
    }

    // Convert the compressed buffer to base64
    const base64Image = `data:image/${format};base64,${compressedImageBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      data: base64Image,
      originalSize: buffer.length,
      compressedSize: compressedImageBuffer.length,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
