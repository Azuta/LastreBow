// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { mockChaptersList } from '@/mock/mediaData';
import { Chapter, ChapterUpload } from '@/types/AniListResponse';

// This simulates a database. In a real app, this would be a database call.
// NOTE: This data will reset every time you save a file in development.
let chapters: Chapter[] = JSON.parse(JSON.stringify(mockChaptersList));

export async function POST(request: Request) {
  try {
    console.log("API /api/upload reached.");
    const formData = await request.formData();
    
    const chapterNumber = formData.get('chapter-number') as string;
    const title = formData.get('chapter-title') as string | null;
    const notes = formData.get('chapter-notes') as string | null;
    const scanGroup = formData.get('scan-group') as string;
    const isEditing = formData.get('is-editing') === 'true';
    const uploadId = formData.get('upload-id') as string | null;

    if (!chapterNumber || !scanGroup) {
      console.error("Validation failed: Missing chapter number or scan group.");
      return NextResponse.json({ message: 'Chapter number and scan group are required.' }, { status: 400 });
    }

    let chapterIndex = chapters.findIndex(c => c.chapterNumber === chapterNumber);

    if (isEditing) {
      // --- EDITING LOGIC ---
      if (chapterIndex === -1 || !uploadId) {
        console.error(`Editing error: Chapter ${chapterNumber} or Upload ID ${uploadId} not found.`);
        return NextResponse.json({ message: 'Chapter or upload to edit not found.' }, { status: 404 });
      }

      const chapter = chapters[chapterIndex];
      const uploadIndex = chapter.uploads.findIndex(u => u.id === uploadId);

      if (uploadIndex === -1) {
        console.error(`Editing error: Upload with ID ${uploadId} not found in chapter ${chapterNumber}.`);
        return NextResponse.json({ message: 'Specific upload version not found.' }, { status: 404 });
      }

      const updatedUpload: ChapterUpload = { ...chapter.uploads[uploadIndex], notes: notes || undefined, uploadedAt: 'just now (edited)' };
      chapter.uploads[uploadIndex] = updatedUpload;
      if (title !== null) chapter.title = title || undefined;
      
      chapters[chapterIndex] = chapter;
      console.log('Chapter updated successfully:', chapter);
      return NextResponse.json({ message: 'Chapter updated successfully!', chapter });

    } else {
      // --- ADDING NEW CHAPTER/UPLOAD LOGIC ---
      const newUpload: ChapterUpload = {
        id: `${scanGroup.toLowerCase().replace(/\s/g, '-')}-${chapterNumber}-${Date.now()}`,
        scanGroup,
        uploadedAt: 'just now',
        notes: notes || undefined,
      };

      if (chapterIndex !== -1) {
        chapters[chapterIndex].uploads.push(newUpload);
        if(title) chapters[chapterIndex].title = title;
      } else {
        const newChapter: Chapter = { chapterNumber, title: title || undefined, uploads: [newUpload] };
        chapters.push(newChapter);
        chapters.sort((a, b) => parseFloat(b.chapterNumber) - parseFloat(a.chapterNumber));
      }
      
      const updatedChapter = chapters.find(c => c.chapterNumber === chapterNumber);
      console.log('Chapter added/updated successfully:', updatedChapter);
      return NextResponse.json({ message: 'Chapter uploaded successfully!', chapter: updatedChapter });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    console.error('CRITICAL ERROR in /api/upload:', errorMessage);
    return NextResponse.json({ message: 'Failed to process request on the server.', error: errorMessage }, { status: 500 });
  }
}