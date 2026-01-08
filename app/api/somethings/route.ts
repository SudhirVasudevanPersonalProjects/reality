// app/api/somethings/route.ts
// API route for creating somethings (text, photo, video) - Phase 1 (ur "reality")

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Response type for something creation
interface SomethingResponse {
  id: string;
  text_content: string | null;
  media_url: string | null;
  captured_at: string | null;
}

interface CreateSomethingResponse {
  success: boolean;
  somethings: SomethingResponse[];
  error?: string;
  failedFiles?: string[];
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
        { success: false, somethings: [], error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const textContent = formData.get("text_content") as string | null;
    const files = formData.getAll("files") as File[];
    const attributesStr = formData.get("attributes") as string | null;
    const attributes = attributesStr ? JSON.parse(attributesStr) : null;

    // Extract and validate coordinates
    const latitudeStr = formData.get("latitude") as string | null;
    const longitudeStr = formData.get("longitude") as string | null;
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (latitudeStr && longitudeStr) {
      const lat = parseFloat(latitudeStr);
      const lng = parseFloat(longitudeStr);

      // Validate coordinate ranges
      if (!isNaN(lat) && !isNaN(lng) &&
          lat >= -90 && lat <= 90 &&
          lng >= -180 && lng <= 180) {
        latitude = lat;
        longitude = lng;
      }
    }

    // Validate that at least one type of content is provided
    if (!textContent && files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          somethings: [],
          error: "No content provided. Please provide text or files.",
        },
        { status: 400 }
      );
    }

    const createdSomethings: SomethingResponse[] = [];
    const failedFiles: string[] = [];
    const trimmedText = textContent?.trim() || null;

    // If text but NO files, create text-only something
    if (trimmedText && trimmedText.length > 0 && files.length === 0) {
      // Determine content type: if attributes has link_preview, it's a URL, otherwise text
      const contentType = attributes?.link_preview ? "url" : "text";

      const { data: textSomething, error: textError } = await supabase
        .from("somethings")
        .insert({
          user_id: user.id,
          text_content: trimmedText,
          content_type: contentType,
          attributes: attributes,
          realm: null, // Phase 1: No realm classification
          captured_at: new Date().toISOString(),
          latitude: latitude,
          longitude: longitude,
        })
        .select("id, text_content, media_url, captured_at")
        .single();

      if (textError) {
        console.error("Error creating text something:", textError);
        return NextResponse.json(
          {
            success: false,
            somethings: [],
            error: "Failed to create text something",
          },
          { status: 500 }
        );
      }

      if (textSomething) {
        createdSomethings.push(textSomething);
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

        // Validate file size (10MB for photos, 50MB for videos/audio)
        const maxSize = file.type.startsWith("video/") || file.type.startsWith("audio/")
          ? 50 * 1024 * 1024
          : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          console.error(`File ${file.name} exceeds size limit`);
          failedFiles.push(`${file.name} (exceeds size limit)`);
          continue;
        }

        // Validate MIME type (images, videos, and audio)
        const isValidFile = file.type.startsWith("image/") ||
                          file.type.startsWith("video/") ||
                          file.type.startsWith("audio/");
        if (!isValidFile) {
          console.error(`Invalid file type: ${file.type}`);
          failedFiles.push(`${file.name} (invalid file type)`);
          continue;
        }

        // Generate unique file path: {user_id}/{timestamp}-{filename}
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `${user.id}/${timestamp}-${sanitizedFilename}`;

        // Read file data
        const fileBytes = await file.bytes();
        const fileBuffer = Buffer.from(fileBytes);

        // Upload file to Supabase Storage (captures-media bucket)
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
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("captures-media")
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Determine content type
        let contentType = "photo";
        if (file.type.startsWith("video/")) {
          contentType = "video";
        } else if (file.type.startsWith("audio/")) {
          contentType = "audio";
        }

        // Create something record (include text if provided with files)
        const { data: fileSomething, error: somethingError } = await supabase
          .from("somethings")
          .insert({
            user_id: user.id,
            media_url: publicUrl,
            text_content: trimmedText && trimmedText.length > 0 ? trimmedText : null,
            content_type: contentType,
            attributes: attributes,
            realm: null, // Phase 1: No realm classification
            captured_at: new Date().toISOString(),
            latitude: latitude,
            longitude: longitude,
          })
          .select("id, text_content, media_url, captured_at")
          .single();

        if (somethingError) {
          console.error(
            "Error creating file something:",
            file.name,
            somethingError
          );
          // Clean up uploaded file if something creation fails
          await supabase.storage.from("captures-media").remove([filePath]);
          failedFiles.push(`${file.name} (database error: ${somethingError.message})`);
          continue;
        }

        if (fileSomething) {
          createdSomethings.push(fileSomething);
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        failedFiles.push(`${file.name} (processing error)`);
        continue;
      }
    }

    // Return success if at least one something was created
    if (createdSomethings.length > 0) {
      // Revalidate paths (no chamber/dashboard for Phase 1, but keep for now)
      revalidatePath('/capture');
      revalidatePath('/ur-reality');

      return NextResponse.json({
        success: true,
        somethings: createdSomethings,
        ...(failedFiles.length > 0 && { failedFiles }),
      });
    }

    // No somethings were created
    const errorDetails =
      failedFiles.length > 0 ? failedFiles.join(", ") : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        somethings: [],
        error: `Failed to create any somethings. Details: ${errorDetails}`,
        failedFiles,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/somethings:", error);
    return NextResponse.json(
      {
        success: false,
        somethings: [],
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all user's somethings (for /ur-reality)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, somethings: [], error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all somethings for user, ordered by captured_at DESC
    const { data: somethings, error: fetchError } = await supabase
      .from("somethings")
      .select("id, text_content, media_url, captured_at, attributes")
      .eq("user_id", user.id)
      .order("captured_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching somethings:", fetchError);
      return NextResponse.json(
        { success: false, somethings: [], error: "Failed to fetch somethings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      somethings: somethings || [],
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/somethings:", error);
    return NextResponse.json(
      { success: false, somethings: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}
