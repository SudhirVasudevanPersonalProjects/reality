// app/api/captures/route.ts
// API route for creating captures (text, photo, video)

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Response type for capture creation
interface CaptureResponse {
  id: string;
  content_type: string;
  created_at: string | null;
}

interface CreateCaptureResponse {
  success: boolean;
  captures: CaptureResponse[];
  error?: string;
  failedFiles?: string[]; // List of filenames that failed to upload
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, captures: [], error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const textContent = formData.get("text_content") as string | null;
    const files = formData.getAll("files") as File[];

    // Validate that at least one type of content is provided
    if (!textContent && files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          captures: [],
          error: "No content provided. Please provide text or files.",
        },
        { status: 400 }
      );
    }

    const createdCaptures: CaptureResponse[] = [];
    const failedFiles: string[] = [];
    const trimmedText = textContent?.trim() || null;

    // If text but NO files, create text-only capture
    if (trimmedText && trimmedText.length > 0 && files.length === 0) {
      // Save the text capture
      const { data: textCapture, error: textError } = await supabase
        .from("somethings")
        .insert({
          user_id: user.id,
          content_type: "text",
          text_content: trimmedText,
          captured_at: new Date().toISOString(),
        })
        .select("id, content_type, created_at")
        .single();

      if (textError) {
        console.error("Error creating text capture:", textError);
        return NextResponse.json(
          {
            success: false,
            captures: [],
            error: "Failed to create text capture",
          },
          { status: 500 }
        );
      }

      if (textCapture) {
        createdCaptures.push(textCapture);
      }

      // Extract and save URLs separately for future querying
      const urlRegex =
        /(https?:\/\/[^\s]+|(?:www\.)?[\w\-]+\.[\w\-]+(?:\.[\w\-]+)*(?:\/[^\s]*)?)/gi;
      const urls = trimmedText.match(urlRegex);

      if (urls && urls.length > 0) {
        // Create separate URL captures (hidden from main dashboard)
        for (const url of urls) {
          await supabase
            .from("somethings")
            .insert({
              user_id: user.id,
              content_type: "url",
              text_content: url,
              captured_at: new Date().toISOString(),
            })
            .select("id, content_type, created_at")
            .single();

          // Don't add URL captures to response - they're for background storage
          // User will only see them when specifically querying for URLs
        }
      }
    }

    // Handle file uploads
    for (const file of files) {
      try {
        // Skip if file is empty or invalid
        if (!file || file.size === 0) {
          console.error("Skipping empty or invalid file");
          continue;
        }

        // Validate file size (10MB for photos, 50MB for videos)
        const maxSize = file.type.startsWith("video/")
          ? 50 * 1024 * 1024
          : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          console.error(`File ${file.name} exceeds size limit`);
          failedFiles.push(`${file.name} (exceeds size limit)`);
          continue; // Skip oversized files
        }

        // Validate MIME type
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          console.error(`Invalid file type: ${file.type}`);
          failedFiles.push(`${file.name} (invalid file type)`);
          continue; // Skip invalid file types
        }

        // Generate unique file path: {user_id}/{timestamp}-{filename}
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `${user.id}/${timestamp}-${sanitizedFilename}`;

        // Read file data - use bytes() for better compatibility
        const fileBytes = await file.bytes();
        const fileBuffer = Buffer.from(fileBytes);

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("captures-media")
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading file:", file.name, uploadError);
          failedFiles.push(
            `${file.name} (upload failed: ${uploadError.message})`
          );
          continue; // Skip failed uploads
        }

        // Generate signed URL for private bucket (valid for 1 year)
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from("captures-media")
          .createSignedUrl(filePath, 31536000); // 1 year in seconds

        if (urlError || !signedUrlData) {
          console.error("Error creating signed URL:", urlError);
          failedFiles.push(`${file.name} (URL generation failed)`);
          continue;
        }

        const publicUrl = signedUrlData.signedUrl;

        // Determine content type based on MIME type
        const contentType = file.type.startsWith("image/") ? "photo" : "video";

        // Create capture record (include text if provided with files)
        const { data: fileCapture, error: captureError } = await supabase
          .from("somethings")
          .insert({
            user_id: user.id,
            content_type: contentType,
            media_url: publicUrl,
            text_content: trimmedText && trimmedText.length > 0 ? trimmedText : null,
            captured_at: new Date().toISOString(),
          })
          .select("id, content_type, created_at")
          .single();

        if (captureError) {
          console.error(
            "Error creating file capture:",
            file.name,
            captureError
          );
          // Clean up uploaded file if capture creation fails
          await supabase.storage.from("captures-media").remove([filePath]);
          failedFiles.push(`${file.name} (database error: ${captureError.message})`);
          continue;
        }

        if (fileCapture) {
          createdCaptures.push(fileCapture);
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        failedFiles.push(`${file.name} (processing error)`);
        continue; // Skip to next file
      }
    }

    // Return success if at least one capture was created
    if (createdCaptures.length > 0) {
      return NextResponse.json({
        success: true,
        captures: createdCaptures,
        ...(failedFiles.length > 0 && { failedFiles }), // Include failed files if any
      });
    }

    // No captures were created
    const errorDetails =
      failedFiles.length > 0 ? failedFiles.join(", ") : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        captures: [],
        error: `Failed to create any captures. Details: ${errorDetails}`,
        failedFiles,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/captures:", error);
    return NextResponse.json(
      {
        success: false,
        captures: [],
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
